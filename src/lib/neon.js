import { neon } from '@neondatabase/serverless';
import { portfolioData as defaultData } from '../data/portfolioData';

const NEON_URL =
  import.meta.env.VITE_NEON_DATABASE_URL ||
  'postgresql://neondb_owner:npg_8iFkIw3DVvCW@ep-autumn-snow-b5xiqct7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

let sqlClient = null;
function getSql() {
  if (!sqlClient && NEON_URL) {
    try {
      sqlClient = neon(NEON_URL);
    } catch (e) {
      console.error('Failed to init Neon client:', e);
    }
  }
  return sqlClient;
}

/**
 * Fetch complete portfolio data from Neon Database (or API)
 */
export async function fetchPortfolioFromNeon() {
  // 1. Try Vercel serverless /api/portfolio first
  try {
    const res = await fetch('/api/portfolio');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (apiErr) {
    // API not available, proceed to direct Neon driver
  }

  // 2. Direct client-side Neon query via HTTPS driver
  try {
    const sql = getSql();
    if (!sql) throw new Error('Neon client not configured');

    // Fetch site_settings
    const settingsRows = await sql`SELECT key, value FROM site_settings;`;
    const settings = {};
    settingsRows.forEach((r) => {
      settings[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
    });

    // Fetch projects
    const pRows = await sql`
      SELECT id, name, tagline, description, image_url, category, year, span, role, tools, accent_color, video_url, media_type, sort, published
      FROM projects
      ORDER BY sort ASC, created_at ASC;
    `;
    const projects = pRows.map((p) => ({
      id: p.id,
      title: p.name,
      category: p.category || p.tagline || 'UI/UX Design',
      year: p.year || '2025',
      span: p.span || 'short',
      description: p.description || '',
      role: p.role || 'Lead Product Designer',
      tools: Array.isArray(p.tools) ? p.tools : (typeof p.tools === 'string' ? JSON.parse(p.tools || '[]') : []),
      accentColor: p.accent_color || '#e7eef0',
      image: p.image_url || '',
      video: p.video_url || '',
      mediaType: p.media_type || (p.video_url ? 'video' : 'image'),
      published: p.published !== false,
    }));

    // Fetch experience
    const eRows = await sql`
      SELECT id, title, org, dates, description, sort
      FROM experience
      ORDER BY sort ASC, created_at ASC;
    `;
    const experience = eRows.map((e) => ({
      id: e.id,
      role: e.title,
      company: e.org,
      period: e.dates,
      description: e.description,
    }));

    // Fetch testimonials
    const tRows = await sql`
      SELECT id, name, role, quote, rating, sort
      FROM testimonials
      ORDER BY sort ASC, created_at ASC;
    `;
    const testimonials = tRows.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      rating: t.rating || 5,
      content: t.quote,
    }));

    const profile = settings.profile || {
      name: defaultData.name,
      title: defaultData.title,
      bio: defaultData.bio,
      email: defaultData.email,
      phone: defaultData.phone,
      socials: defaultData.socials,
    };

    return {
      name: profile.name,
      title: profile.title,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone,
      socials: profile.socials,
      stats: settings.stats || defaultData.stats,
      projects: projects.length > 0 ? projects : defaultData.projects,
      experience: experience.length > 0 ? experience : defaultData.experience,
      testimonials: testimonials.length > 0 ? testimonials : defaultData.testimonials,
      cloudinary: settings.cloudinary || { cloud_name: '', upload_preset: '', folder: 'portfolio' },
    };
  } catch (dbErr) {
    console.warn('Neon DB fetch failed, using default data:', dbErr.message);
    return defaultData;
  }
}

/**
 * Save / Update an item or section in Neon Database
 */
export async function saveToNeon(type, data) {
  // 1. Try API route first
  try {
    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    });
    if (res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (apiErr) {
    // API not reachable, try direct Neon connection
  }

  // 2. Direct Neon query via HTTPS driver
  const sql = getSql();
  if (!sql) throw new Error('Cannot connect to Neon Database');

  if (type === 'profile') {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('profile', ${JSON.stringify(data)}, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    if (data.email || data.phone) {
      await sql`
        INSERT INTO contact (id, email, phone, linkedin_url, created_at)
        VALUES ('contact', ${data.email || ''}, ${data.phone || ''}, ${data.socials?.linkedin || ''}, now())
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          linkedin_url = EXCLUDED.linkedin_url
      `;
    }
    return { success: true };
  }

  if (type === 'stats') {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('stats', ${JSON.stringify(data)}, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    return { success: true };
  }

  if (type === 'cloudinary') {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('cloudinary', ${JSON.stringify(data)}, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    return { success: true };
  }

  if (type === 'project') {
    const p = data;
    await sql`
      INSERT INTO projects (
        id, name, tagline, description, image_url, category, year, span, role, tools, accent_color, video_url, media_type, sort, published
      )
      VALUES (
        ${p.id},
        ${p.title},
        ${p.category || ''},
        ${p.description || ''},
        ${p.image || ''},
        ${p.category || ''},
        ${p.year || '2025'},
        ${p.span || 'short'},
        ${p.role || ''},
        ${JSON.stringify(p.tools || [])},
        ${p.accentColor || '#e7eef0'},
        ${p.video || ''},
        ${p.mediaType || 'image'},
        ${p.sort || 1},
        ${p.published !== false}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        category = EXCLUDED.category,
        year = EXCLUDED.year,
        span = EXCLUDED.span,
        role = EXCLUDED.role,
        tools = EXCLUDED.tools,
        accent_color = EXCLUDED.accent_color,
        video_url = EXCLUDED.video_url,
        media_type = EXCLUDED.media_type,
        sort = EXCLUDED.sort,
        published = EXCLUDED.published
    `;
    return { success: true };
  }

  if (type === 'delete_project') {
    await sql`DELETE FROM projects WHERE id = ${data.id}`;
    return { success: true };
  }

  if (type === 'experience') {
    const exp = data;
    await sql`
      INSERT INTO experience (id, title, org, dates, description, sort, created_at)
      VALUES (${exp.id}, ${exp.role}, ${exp.company}, ${exp.period}, ${exp.description}, ${exp.sort || 1}, now())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        org = EXCLUDED.org,
        dates = EXCLUDED.dates,
        description = EXCLUDED.description,
        sort = EXCLUDED.sort
    `;
    return { success: true };
  }

  if (type === 'delete_experience') {
    await sql`DELETE FROM experience WHERE id = ${data.id}`;
    return { success: true };
  }

  if (type === 'testimonial') {
    const t = data;
    await sql`
      INSERT INTO testimonials (id, name, role, quote, rating, sort, created_at)
      VALUES (${t.id}, ${t.name}, ${t.role}, ${t.content}, ${t.rating || 5}, ${t.sort || 1}, now())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        quote = EXCLUDED.quote,
        rating = EXCLUDED.rating,
        sort = EXCLUDED.sort
    `;
    return { success: true };
  }

  if (type === 'delete_testimonial') {
    await sql`DELETE FROM testimonials WHERE id = ${data.id}`;
    return { success: true };
  }

  return { success: false, error: 'Unknown type' };
}

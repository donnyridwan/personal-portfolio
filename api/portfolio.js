import { neon } from '@neondatabase/serverless';

function getDb() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.VITE_NEON_DATABASE_URL ||
    'postgresql://neondb_owner:npg_8iFkIw3DVvCW@ep-autumn-snow-b5xiqct7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
  return neon(connectionString);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = getDb();

    if (req.method === 'GET') {
      // 1. Fetch site_settings (profile, stats, cloudinary)
      const settingsRows = await sql`SELECT key, value FROM site_settings;`;
      const settingsMap = {};
      settingsRows.forEach((row) => {
        settingsMap[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
      });

      // 2. Fetch Projects
      const projectRows = await sql`
        SELECT id, name, tagline, description, image_url, category, year, span, role, tools, accent_color, video_url, media_type, sort, published
        FROM projects
        ORDER BY sort ASC, created_at ASC;
      `;

      const projects = projectRows.map((p) => ({
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

      // 3. Fetch Experience
      const expRows = await sql`
        SELECT id, title, org, dates, description, sort
        FROM experience
        ORDER BY sort ASC, created_at ASC;
      `;
      const experience = expRows.map((e) => ({
        id: e.id,
        role: e.title,
        company: e.org,
        period: e.dates,
        description: e.description,
      }));

      // 4. Fetch Testimonials
      const testRows = await sql`
        SELECT id, name, role, quote, rating, sort
        FROM testimonials
        ORDER BY sort ASC, created_at ASC;
      `;
      const testimonials = testRows.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        rating: t.rating || 5,
        content: t.quote,
      }));

      const profile = settingsMap.profile || {
        name: 'Donny Ridwan S',
        title: 'UI/UX Designer | Web Designer',
        bio: 'UI/UX designer with 4+ years of experience across SaaS, fintech & ecommerce. I build interfaces that simplify complex systems and help users finish what they started.',
        email: 'donnyr65@gmail.com',
        phone: '+62 851 5599 8060',
        socials: {
          linkedin: 'https://linkedin.com/in/donnyridwan',
          x: 'https://x.com/donnyridwan',
          facebook: 'https://facebook.com/donnyridwan',
        },
      };

      const stats = settingsMap.stats || [
        { value: '2', unit: 'Yrs', label: 'Designing Digital Product' },
        { value: '31', unit: '', label: 'Project Success on Upwork' },
        { value: '83%', unit: '', label: 'Job Success Score on Upwork' },
        { value: '1,067', unit: '', label: 'Logged Hours of work so far' },
      ];

      const cloudinary = settingsMap.cloudinary || {
        cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || '',
        upload_preset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
        folder: 'portfolio',
      };

      return res.status(200).json({
        success: true,
        data: {
          name: profile.name,
          title: profile.title,
          bio: profile.bio,
          email: profile.email,
          phone: profile.phone,
          socials: profile.socials,
          stats,
          projects,
          experience,
          testimonials,
          cloudinary,
        },
      });
    }

    if (req.method === 'POST') {
      const body = req.body;
      const { type, data } = body;

      if (!type || !data) {
        return res.status(400).json({ success: false, error: 'Missing type or data in request body' });
      }

      if (type === 'profile') {
        await sql`
          INSERT INTO site_settings (key, value, updated_at)
          VALUES ('profile', ${JSON.stringify(data)}, now())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
        `;
        // Also update contact table
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
        return res.status(200).json({ success: true, message: 'Profile updated in Neon' });
      }

      if (type === 'stats') {
        await sql`
          INSERT INTO site_settings (key, value, updated_at)
          VALUES ('stats', ${JSON.stringify(data)}, now())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
        `;
        return res.status(200).json({ success: true, message: 'Stats updated in Neon' });
      }

      if (type === 'cloudinary') {
        await sql`
          INSERT INTO site_settings (key, value, updated_at)
          VALUES ('cloudinary', ${JSON.stringify(data)}, now())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
        `;
        return res.status(200).json({ success: true, message: 'Cloudinary settings updated in Neon' });
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
        return res.status(200).json({ success: true, message: 'Project saved in Neon' });
      }

      if (type === 'delete_project') {
        const { id } = data;
        await sql`DELETE FROM projects WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Project deleted from Neon' });
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
        return res.status(200).json({ success: true, message: 'Experience saved in Neon' });
      }

      if (type === 'delete_experience') {
        const { id } = data;
        await sql`DELETE FROM experience WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Experience deleted from Neon' });
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
        return res.status(200).json({ success: true, message: 'Testimonial saved in Neon' });
      }

      if (type === 'delete_testimonial') {
        const { id } = data;
        await sql`DELETE FROM testimonials WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Testimonial deleted from Neon' });
      }

      if (type === 'media_item') {
        const m = data;
        await sql`
          INSERT INTO media_library (id, url, public_id, format, resource_type, created_at)
          VALUES (${m.id}, ${m.url}, ${m.public_id || ''}, ${m.format || ''}, ${m.resource_type || 'image'}, now())
          ON CONFLICT (id) DO NOTHING
        `;
        return res.status(200).json({ success: true, message: 'Media saved to library' });
      }

      return res.status(400).json({ success: false, error: 'Unknown type' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}

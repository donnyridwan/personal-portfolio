import { portfolioData as defaultData } from '../data/portfolioData';

// All Neon access goes through the Vercel serverless function at /api/portfolio,
// which reads DATABASE_URL from server-only env. Never connect to the DB from the browser.

/**
 * Fetch complete portfolio data from Neon Database (via API)
 */
export async function fetchPortfolioFromNeon() {
  try {
    const res = await fetch('/api/portfolio');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
    throw new Error(`API responded with status ${res.status}`);
  } catch (err) {
    console.warn('Portfolio API fetch failed, using default data:', err.message);
    return defaultData;
  }
}

/**
 * Save / Update an item or section in Neon Database (via authenticated API)
 */
export async function saveToNeon(type, data) {
  const token = sessionStorage.getItem('cms_auth_token') || '';

  let res;
  try {
    res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, data }),
    });
  } catch {
    throw new Error('API /api/portfolio tidak dapat dijangkau (gunakan `vercel dev` untuk lokal)');
  }

  const json = await res.json().catch(() => ({}));
  if (res.status === 401) {
    throw new Error('Sesi CMS tidak valid atau kedaluwarsa. Silakan logout dan login ulang.');
  }
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `API responded with status ${res.status}`);
  }
  return json;
}

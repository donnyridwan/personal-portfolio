// Maps the current URL to a view. Path routes (/work/<slug>, /admin) win over hash and ?tab= routes.

const TABS = ['work', 'about', 'contact', 'chat'];
const CMS_KEYS = ['cms', 'admin'];

function safeDecode(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function parseRoute(pathname, hash, search) {
  // Project paths first, so slugs like "admin-dashboard" never fall through to the CMS rule
  const projectMatch = (pathname || '').match(/^\/work\/([^/]+)\/?$/);
  if (projectMatch) return { view: 'project', slug: safeDecode(projectMatch[1]).toLowerCase() };

  const path = (pathname || '').toLowerCase();
  if (/(^|\/)(admin|cms)(\/|$)/.test(path)) return { view: 'cms' };

  const hashTab = (hash || '').replace('#', '').toLowerCase();
  if (CMS_KEYS.includes(hashTab)) return { view: 'cms' };
  if (TABS.includes(hashTab)) return { view: hashTab };

  const query = (search || '').toLowerCase();
  const tab = (new URLSearchParams(query).get('tab') || '').toLowerCase();
  if (CMS_KEYS.includes(tab)) return { view: 'cms' };
  if (TABS.includes(tab)) return { view: tab };

  if (query.includes('admin') || query.includes('cms')) return { view: 'cms' };
  return { view: 'work' };
}

export function projectPath(slug) {
  return `/work/${slug}`;
}

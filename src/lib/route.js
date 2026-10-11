// Maps the current URL to a view. Path routes (/work/<slug>, /admin) win over hash and ?tab= routes.

const TABS = ['work', 'about', 'contact', 'chat'];
const CMS_KEYS = ['cms', 'admin'];

export function parseRoute(pathname, hash, search) {
  const path = (pathname || '').toLowerCase();
  if (path.includes('/admin') || path.includes('/cms')) return { view: 'cms' };

  const projectMatch = (pathname || '').match(/^\/work\/([^/]+)\/?$/);
  if (projectMatch) return { view: 'project', slug: decodeURIComponent(projectMatch[1]).toLowerCase() };

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

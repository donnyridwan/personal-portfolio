// URL-safe slug helpers shared by the site, the CMS and the /api functions (keep framework-free)

export function slugify(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueSlug(base, taken) {
  const root = base || 'project';
  const used = new Set(taken);
  if (!used.has(root)) return root;
  let n = 2;
  while (used.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}

// Returns an Indonesian error message for the CMS, or null when the slug is usable
export function validateSlug(slug, existingSlugs, ownSlug) {
  if (!slug) return 'Slug wajib diisi';
  if (!/^[a-z0-9-]+$/.test(slug)) return 'Hanya huruf kecil, angka, dan tanda -';
  if (slug !== ownSlug && existingSlugs.includes(slug)) return 'Slug sudah dipakai project lain';
  return null;
}

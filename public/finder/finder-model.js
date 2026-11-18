// Logika data Finder — murni, tanpa DOM, supaya bisa dites dengan `node --test`.

const PROJECT_FIELDS = ['id', 'name', 'categories', 'thumbnail', 'images'];

/** Daftar masalah di data; array kosong berarti valid. */
export function validateData(data) {
  const errs = [];
  if (!data || typeof data !== 'object') return ['data bukan objek'];
  for (const key of ['favorites', 'categories', 'projects', 'featured']) {
    if (!Array.isArray(data[key])) errs.push(`"${key}" harus array`);
  }
  if (errs.length) return errs;

  const catIds = new Set(data.categories.map(c => c.id));
  const projIds = new Set();
  for (const p of data.projects) {
    for (const f of PROJECT_FIELDS) {
      if (p[f] === undefined) errs.push(`proyek "${p.id ?? '?'}" tidak punya "${f}"`);
    }
    if (projIds.has(p.id)) errs.push(`id proyek ganda: "${p.id}"`);
    projIds.add(p.id);
    for (const c of p.categories ?? []) {
      if (!catIds.has(c)) errs.push(`proyek "${p.id}" memakai kategori tak dikenal "${c}"`);
    }
  }
  for (const f of data.featured) {
    if (!projIds.has(f.projectId)) errs.push(`featured menunjuk proyek tak dikenal "${f.projectId}"`);
  }
  return errs;
}

export function getProject(data, id) {
  return data.projects.find(p => p.id === id) ?? null;
}

export function projectsInCategory(data, categoryId) {
  return data.projects.filter(p => (p.categories ?? []).includes(categoryId));
}

export function featuredProjects(data) {
  return data.featured
    .map(f => ({ project: getProject(data, f.projectId), color: f.color }))
    .filter(f => f.project);
}

/** Riwayat navigasi ‹ › seperti di Finder. */
export function createHistory(initial) {
  const stack = [initial];
  let i = 0;
  return {
    current: () => stack[i],
    push(view) { stack.splice(i + 1); stack.push(view); i = stack.length - 1; },
    back() { if (i > 0) i--; return stack[i]; },
    forward() { if (i < stack.length - 1) i++; return stack[i]; },
    canBack: () => i > 0,
    canForward: () => i < stack.length - 1,
  };
}

/* Pilihan tampilan folder (seperti View di Finder Mac). */
export const VIEW_MODES = ['list', 'details', 'grid'];
export const GRID_SIZES = ['small', 'medium', 'large'];
export const DEFAULT_VIEW_PREFS = Object.freeze({ mode: 'grid', gridSize: 'medium' });

/** Membaca pilihan tersimpan (string JSON); nilai rusak/tak dikenal jatuh ke default. */
export function parseViewPrefs(raw) {
  let p = {};
  try { p = JSON.parse(raw) ?? {}; } catch { p = {}; }
  return {
    mode: VIEW_MODES.includes(p.mode) ? p.mode : DEFAULT_VIEW_PREFS.mode,
    gridSize: GRID_SIZES.includes(p.gridSize) ? p.gridSize : DEFAULT_VIEW_PREFS.gridSize,
  };
}

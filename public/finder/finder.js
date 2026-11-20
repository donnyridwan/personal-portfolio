// Finder baru ala macOS. Di situs utama isinya dari /api/finder (database);
// preview.html memakai finder-data.json sebagai data contoh offline.
import {
  validateData, getProject, projectsInCategory, featuredProjects, createHistory,
  parseViewPrefs, VIEW_MODES, GRID_SIZES,
} from './finder-model.js';
import { renderDoc } from './doc-render.js';
import { renderAboutPage } from '../about/about-render.js';

// v2: default berubah jadi Grid sedang; pilihan lama (default Detail) tidak dipakai lagi.
const PREFS_KEY = 'dockfolio-finder-view-v2';

function loadPrefs() {
  try { return parseViewPrefs(localStorage.getItem(PREFS_KEY)); } catch { return parseViewPrefs(null); }
}
function savePrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* mode privat: abaikan */ }
}
let prefs = loadPrefs();

const SITE_ROOT = new URL('../', import.meta.url);
// Hanya di situs utama (bukan di preview.html) data diambil dari API dan Finder disambungkan ke Framer.
const IS_MAIN_SITE = !location.pathname.includes('/finder/');
const DEFAULT_DATA_URL = IS_MAIN_SITE
  ? new URL('api/finder', SITE_ROOT).href
  : new URL('finder-data.json', import.meta.url).href;

let data = null;
let dataPromise = null;
let history = null;
let root = null;
let selectedRow = null;
let pendingView = null; // tampilan yang diminta saat data belum siap

/* ---------- Data ---------- */

export async function loadFinderData(url = DEFAULT_DATA_URL) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Gagal memuat data Finder (${res.status})`);
  const json = await res.json();
  const errs = validateData(json);
  if (errs.length) console.warn('[finder] Masalah di data:', errs);
  return json;
}

function ensureData() {
  if (!dataPromise) {
    dataPromise = loadFinderData()
      .then(d => (data = d))
      .catch(err => { dataPromise = null; throw err; }); // gagal: boleh dicoba lagi
  }
  return dataPromise;
}

/** Data bersama untuk desktop.js dan edit.js (satu kali ambil). */
export const loadData = ensureData;

/** Ambil ulang data (setelah diubah di mode edit) lalu gambar ulang Finder yang sedang terbuka. */
export async function reloadData() {
  dataPromise = null;
  await ensureData();
  if (root?.isConnected && history) {
    const cur = history.current();
    const gone = (cur.type === 'project' && !getProject(data, cur.id))
      || (cur.type === 'category' && !data.categories.some(c => c.id === cur.id));
    renderSidebar();
    if (gone) {
      const first = data.categories.find(c => projectsInCategory(data, c.id).length) ?? data.categories[0];
      history = createHistory({ type: 'category', id: first?.id });
    }
    render();
  }
  window.dispatchEvent(new CustomEvent('dockfolio:data', { detail: data }));
  return data;
}

export const currentView = () => (root?.isConnected && history ? history.current() : null);

/** Mode edit memasang editor di atas tampilan yang baru digambar. fn(view, contentEl, data). */
let renderHook = null;
export function setRenderHook(fn) { renderHook = fn; }
export const finderRoot = () => (root?.isConnected ? root : null);

/** Path lokal di data ("assets/…") dihitung dari root situs; URL penuh dibiarkan. */
function asset(path) {
  return path ? new URL(path, SITE_ROOT).href : '';
}

/* ---------- Util ---------- */

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  folder: '<path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h3l1.5 1.5h4.5A1.5 1.5 0 0 1 14 6v5.5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  person: '<circle cx="8" cy="5.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M3 13.5c.6-2.4 2.6-3.7 5-3.7s4.4 1.3 5 3.7" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  doc: '<path d="M4 2h5l3 3v9H4z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M9 2v3h3M6 8.5h4M6 11h4" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  mail: '<rect x="2" y="3.5" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="m2.5 4.5 5.5 4 5.5-4" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  back: '<path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  fwd: '<path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  menu: '<path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  'view-list': '<path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  'view-details': '<rect x="2" y="3" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M2 6.5h12M6.5 6.5V13" stroke="currentColor" stroke-width="1.3"/>',
  'view-grid': '<rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="2.5" width="4.5" height="4.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="2.5" y="9" width="4.5" height="4.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="9" width="4.5" height="4.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  minus: '<path d="M3.5 8h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  plus: '<path d="M3.5 8h9M8 3.5v9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  external: '<path d="M9 3h4v4M13 3 7.5 8.5M11 9.5V13H3V5h3.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
};
const icon = (name, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 16 16" aria-hidden="true">${ICONS[name] ?? ''}</svg>`;

/** Server gambar Framer bisa mengecilkan gambar; minta ukuran secukupnya. */
function sized(url, px) {
  try {
    const u = new URL(url);
    if (u.hostname === 'framerusercontent.com') u.searchParams.set('scale-down-to', String(px));
    return u.href;
  } catch { return url; }
}

const img = (src, cls = '', w = 20, h = 20) => src
  ? `<img src="${esc(sized(asset(src), w > 100 ? 1024 : 512))}" alt="" width="${w}" height="${h}" class="${cls}" loading="lazy" decoding="async">`
  // Belum ada gambar: kotak abu-abu seukuran gambar (bukan ikon gambar rusak).
  : `<img alt="" width="${w}" height="${h}" class="${cls} df-img-failed">`;

const MODE_LABELS = { list: 'List', details: 'Detail', grid: 'Grid' };
// Ukuran thumbnail grid (px). Ditampilkan sebagai persen zoom relatif ke ukuran sedang.
const GRID_PX = { small: 72, medium: 96, large: 144 };
const zoomLabel = size => `${Math.round((GRID_PX[size] / GRID_PX.medium) * 100)}%`;

/* ---------- Window ---------- */

function buildWindow() {
  root = document.createElement('div');
  root.id = 'df-finder';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Finder');
  root.innerHTML = `
    <div class="df-titlebar">
      <div class="df-lights">
        <button class="df-light df-light-close" data-act="close" aria-label="Tutup"></button>
        <span class="df-light df-light-min"></span>
        <span class="df-light df-light-max"></span>
      </div>
      <button class="df-menu-btn" data-act="menu" aria-label="Sidebar">${icon('menu')}</button>
      <div class="df-nav">
        <button data-act="back" aria-label="Kembali">${icon('back')}</button>
        <button data-act="fwd" aria-label="Maju">${icon('fwd')}</button>
      </div>
      <div class="df-title"></div>
      <div class="df-toolbar">
        <div class="df-seg df-modes" role="group" aria-label="Tampilan">
          ${VIEW_MODES.map(m => `<button data-act="mode" data-mode="${m}" aria-label="${MODE_LABELS[m]}" title="${MODE_LABELS[m]}">${icon(`view-${m}`)}</button>`).join('')}
        </div>
      </div>
    </div>
    <div class="df-body">
      <nav class="df-sidebar"></nav>
      <main class="df-content"></main>
      <div class="df-zoom" role="group" aria-label="Ukuran ikon">
        <button data-act="zoom" data-step="-1" aria-label="Perkecil ikon" title="Perkecil">${icon('minus', 14)}</button>
        <span class="df-zoom-val" aria-live="polite"></span>
        <button data-act="zoom" data-step="1" aria-label="Perbesar ikon" title="Perbesar">${icon('plus', 14)}</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  // Posisi awal: di tengah.
  // offsetWidth/Height tidak terpengaruh scale() animasi buka, beda dengan getBoundingClientRect.
  const w = root.offsetWidth;
  const h = root.offsetHeight;
  root.style.left = `${Math.max(0, (innerWidth - w) / 2)}px`;
  root.style.top = `${Math.max(40, (innerHeight - h) / 2 - 30)}px`;

  root.addEventListener('click', onClick);
  root.addEventListener('dblclick', onDblClick);
  // Gambar gagal dimuat: buang src, kotak abu-abu tetap berukuran.
  root.addEventListener('error', e => {
    if (e.target.tagName === 'IMG') {
      e.target.removeAttribute('src');
      e.target.classList.add('df-img-failed');
    }
  }, true);
  // Klik di dalam Finder tidak boleh sampai ke Framer di belakangnya.
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'wheel']) {
    root.addEventListener(t, e => e.stopPropagation());
  }
  setupDrag(root.querySelector('.df-titlebar'));
}

/** Isi jendela saat data belum ada: "Memuat…" atau pesan gagal + tombol coba lagi. */
function showStatus(kind) {
  root.querySelector('.df-title').textContent = 'Finder';
  root.querySelector('.df-toolbar').hidden = true;
  root.querySelector('.df-zoom').hidden = true;
  root.querySelector('[data-act="back"]').disabled = true;
  root.querySelector('[data-act="fwd"]').disabled = true;
  root.querySelector('.df-content').innerHTML = kind === 'error'
    ? `<div class="df-empty df-status" role="alert"><div>
         <p>Data belum bisa dimuat. Coba lagi.</p>
         <button class="df-retry" data-act="retry">Coba lagi</button>
       </div></div>`
    : '<div class="df-empty df-status" aria-live="polite">Memuat…</div>';
}

/** Tunggu data, lalu tampilkan isi jendela yang sedang terbuka. */
async function showWhenReady() {
  const win = root;
  if (!data) {
    showStatus('loading');
    try {
      await ensureData();
    } catch (err) {
      console.error('[finder]', err);
      if (root === win) showStatus('error');
      return;
    }
  }
  if (!root || root !== win) return; // jendela ditutup saat memuat
  const target = pendingView;
  pendingView = null;
  if (!history) {
    const firstFilled = data.categories.find(c => projectsInCategory(data, c.id).length) ?? data.categories[0];
    history = createHistory(target ?? { type: 'category', id: firstFilled?.id });
    renderSidebar();
    render();
  } else if (target) {
    navigate(target);
  }
}

function setupDrag(bar) {
  let start = null;
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || innerWidth <= 700) return;
    const r = root.getBoundingClientRect();
    start = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
    bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', e => {
    if (!start) return;
    const r = root.getBoundingClientRect();
    const left = Math.min(Math.max(start.left + e.clientX - start.x, 0), innerWidth - r.width);
    const top = Math.min(Math.max(start.top + e.clientY - start.y, 0), innerHeight - 44);
    root.style.left = `${left}px`;
    root.style.top = `${top}px`;
  });
  const end = () => { start = null; };
  bar.addEventListener('pointerup', end);
  bar.addEventListener('pointercancel', end);
}

function onKey(e) {
  // Esc di dalam editor/isian (mis. menutup menu "/") tidak menutup Finder.
  if (e.target?.closest?.('[contenteditable="true"], input, textarea')) return;
  if (e.key === 'Escape' && root?.isConnected) closeFinder();
}

function onClick(e) {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  if (act === 'close') return closeFinder();
  if (act === 'retry') return showWhenReady();
  if (act === 'menu') return root.classList.toggle('df-sidebar-open');
  if (act === 'back') { if (history.canBack()) { history.back(); render(); } return; }
  if (act === 'fwd') { if (history.canForward()) { history.forward(); render(); } return; }
  if (act === 'mode' || act === 'zoom') {
    if (act === 'mode') prefs.mode = el.dataset.mode;
    else {
      const i = GRID_SIZES.indexOf(prefs.gridSize) + Number(el.dataset.step);
      prefs.gridSize = GRID_SIZES[Math.min(Math.max(i, 0), GRID_SIZES.length - 1)];
    }
    savePrefs();
    render();
    return;
  }
  if (act === 'go') {
    navigate(JSON.parse(el.dataset.view));
    root.classList.remove('df-sidebar-open');
    return;
  }
  if (act === 'select') {
    // Klik sekali: pilih baris (seperti Finder). Di layar sentuh langsung buka.
    if (matchMedia('(hover: none)').matches) return navigate(JSON.parse(el.dataset.view));
    selectedRow?.classList.remove('df-selected');
    selectedRow = el;
    el.classList.add('df-selected');
  }
}

function onDblClick(e) {
  const el = e.target.closest('[data-act="select"]');
  if (el) navigate(JSON.parse(el.dataset.view));
}

function navigate(view) {
  const cur = history.current();
  if (JSON.stringify(cur) !== JSON.stringify(view)) history.push(view);
  render();
}

/* ---------- Render ---------- */

const viewAttr = v => esc(JSON.stringify(v));

function renderSidebar() {
  const fav = data.favorites.map(f =>
    `<button class="df-item" data-act="go" data-view="${viewAttr({ type: f.id })}">${icon(f.icon)}<span>${esc(f.label)}</span></button>`).join('');
  const cats = data.categories.map(c =>
    `<button class="df-item" data-act="go" data-view="${viewAttr({ type: 'category', id: c.id })}">${icon('folder')}<span>${esc(c.label)}</span></button>`).join('');
  const feat = featuredProjects(data).map(({ project, color }) =>
    `<button class="df-item" data-act="go" data-view="${viewAttr({ type: 'project', id: project.id })}"><span class="df-dot" style="background:${esc(color)}"></span><span>${esc(project.name)}</span></button>`).join('');
  root.querySelector('.df-sidebar').innerHTML = `
    <div class="df-section-label">Favorites</div>${fav}
    <div class="df-section-label">Projects</div>${cats}
    ${feat ? `<div class="df-section-label">Featured</div>${feat}` : ''}`;
}

/** Item sidebar yang ditandai aktif untuk tampilan ini. */
function activeSidebarView(view) {
  if (view.type !== 'project') return view;
  if (data.featured.some(f => f.projectId === view.id)) return view;
  const p = getProject(data, view.id);
  return p?.categories?.[0] ? { type: 'category', id: p.categories[0] } : null;
}

function render() {
  const view = history.current();
  selectedRow = null;
  const active = JSON.stringify(activeSidebarView(view));
  for (const b of root.querySelectorAll('.df-sidebar .df-item')) {
    b.classList.toggle('df-active', b.dataset.view === active);
  }
  root.querySelector('[data-act="back"]').disabled = !history.canBack();
  root.querySelector('[data-act="fwd"]').disabled = !history.canForward();

  // Pilihan tampilan hanya relevan di dalam folder kategori.
  const toolbar = root.querySelector('.df-toolbar');
  toolbar.hidden = view.type !== 'category';
  // Kontrol zoom mengambang di kanan bawah, hanya untuk folder dalam mode Grid.
  const zoom = root.querySelector('.df-zoom');
  zoom.hidden = view.type !== 'category' || prefs.mode !== 'grid';
  zoom.querySelector('.df-zoom-val').textContent = zoomLabel(prefs.gridSize);
  const zi = GRID_SIZES.indexOf(prefs.gridSize);
  zoom.querySelector('[data-step="-1"]').disabled = zi === 0;
  zoom.querySelector('[data-step="1"]').disabled = zi === GRID_SIZES.length - 1;
  for (const b of toolbar.querySelectorAll('[data-mode]')) b.setAttribute('aria-pressed', b.dataset.mode === prefs.mode);

  const { title, html } = renderView(view);
  root.querySelector('.df-title').textContent = title;
  const content = root.querySelector('.df-content');
  content.innerHTML = html;
  content.scrollTop = 0;
  renderHook?.(view, content, data);
}

function renderView(view) {
  switch (view.type) {
    case 'category': return renderCategory(view.id);
    case 'project': return renderProject(view.id);
    case 'about': return renderAbout();
    case 'contact': return renderContact();
    case 'resume': return renderResume();
    default: return { title: 'Finder', html: '' };
  }
}

function labelFor(type) {
  return data.favorites.find(f => f.id === type)?.label ?? type;
}

function renderCategory(id) {
  const cat = data.categories.find(c => c.id === id);
  const title = cat?.label ?? 'Finder';
  const items = projectsInCategory(data, id);
  if (!items.length) return { title, html: '<div class="df-empty">Belum ada proyek</div>' };
  const open = p => `data-act="select" data-view="${viewAttr({ type: 'project', id: p.id })}"`;

  if (prefs.mode === 'list') {
    const rows = items.map(p => `
      <li ${open(p)}>${img(p.thumbnail, '', 32, 32)}<span class="df-list-name">${esc(p.name)}</span><span class="df-cell-muted">${esc(p.client)}</span></li>`).join('');
    return { title, html: `<ul class="df-simple">${rows}</ul>` };
  }

  if (prefs.mode === 'grid') {
    const px = GRID_PX[prefs.gridSize];
    const cells = items.map(p => `
      <div class="df-tile" ${open(p)}>${img(p.thumbnail, '', px, px)}<span>${esc(p.name)}</span></div>`).join('');
    return { title, html: `<div class="df-grid df-grid-${prefs.gridSize}" style="--df-tile:${px}px">${cells}</div>` };
  }

  const rows = items.map(p => `
    <tr data-act="select" data-view="${viewAttr({ type: 'project', id: p.id })}">
      <td><div class="df-name-cell">${img(p.thumbnail)}<span>${esc(p.name)}</span></div></td>
      <td class="df-cell-muted">${esc(title)}</td>
      <td class="df-cell-muted">${esc(p.year)}</td>
    </tr>`).join('');
  return {
    title,
    html: `<table class="df-list"><thead><tr><th>Name</th><th>Kind</th><th>Year</th></tr></thead><tbody>${rows}</tbody></table>`,
  };
}

function renderProject(id) {
  const p = getProject(data, id);
  if (!p) return { title: 'Finder', html: '<div class="df-empty">Proyek tidak ditemukan</div>' };
  const section = (h, body) => (body ? `<h3>${h}</h3><p>${esc(body)}</p>` : '');
  const visit = p.url
    ? `<a class="df-visit" href="${esc(p.url)}" target="_blank" rel="noopener">Visit ${icon('external', 13)}</a>`
    : '';
  const tags = (p.tags ?? []).map(t => `<span>${esc(t)}</span>`).join('');
  if (p.body) {
    // Kop (template) + isi bebas dari kanvas.
    return {
      title: p.name,
      html: `
        <article class="df-detail">
          <div class="df-detail-head">
            ${img(p.thumbnail, '', 48, 48)}
            <div><h2>${esc(p.name)}</h2><div class="df-meta">Client: ${esc(p.client)} • Year: ${esc(p.year)}</div></div>
            ${visit}
          </div>
          ${tags ? `<div class="df-tags df-kop-tags">${tags}</div>` : ''}
          <div class="df-doc" data-project="${esc(p.id)}">${renderDoc(p.body, src => img(src, '', 640, 400))}</div>
        </article>`,
    };
  }
  const preview = (p.images ?? []).map(src => img(src, '', 640, 400)).join('');
  return {
    title: p.name,
    html: `
      <article class="df-detail">
        <div class="df-detail-head">
          ${img(p.thumbnail, '', 48, 48)}
          <div><h2>${esc(p.name)}</h2><div class="df-meta">Client: ${esc(p.client)} • Year: ${esc(p.year)}</div></div>
          ${visit}
        </div>
        ${p.summary ? `<div class="df-summary">${esc(p.summary)}</div>` : ''}
        ${tags ? `<h3>Category</h3><div class="df-tags">${tags}</div>` : ''}
        ${preview ? `<h3>Preview</h3><div class="df-preview">${preview}</div>` : ''}
        ${section('Challenges', p.challenge)}
        ${section('Solution', p.solution)}
        ${section('Final thoughts', p.finalThoughts)}
      </article>`,
  };
}

function renderAbout() {
  return { title: labelFor('about'), html: `<div class="df-page df-about">${renderAboutPage(data)}</div>` };
}

function renderContact() {
  const c = data.contact ?? {};
  const rows = [
    c.email ? `<li><span>Email</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : '',
    ...(c.links ?? []).map(l =>
      `<li><span>${esc(l.label)}</span><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.url.replace(/^(https?:\/\/(www\.)?|tel:|mailto:)/, '').replace(/\/$/, ''))}</a></li>`),
  ].join('');
  return {
    title: labelFor('contact'),
    html: `<div class="df-page"><h2>${esc(labelFor('contact'))}</h2><ul class="df-links">${rows}</ul></div>`,
  };
}

function renderResume() {
  const url = data.resume?.url;
  if (!url) return { title: labelFor('resume'), html: '<div class="df-empty">Resume belum tersedia</div>' };
  // Viewer PDF browser: tanpa panel thumbnail halaman, zoom 75% (dihormati Chrome/Edge/Firefox).
  const href = `${asset(url).split('#')[0]}#zoom=75&navpanes=0&pagemode=none`;
  return {
    title: labelFor('resume'),
    html: `<iframe class="df-resume" src="${esc(href)}" title="Resume"></iframe>`,
  };
}

/* ---------- API ---------- */

export async function openFinder(view) {
  if (!root?.isConnected) {
    history = null;
    buildWindow();
    document.addEventListener('keydown', onKey);
    const win = root;
    requestAnimationFrame(() => requestAnimationFrame(() => win.classList.add('df-open')));
  }
  if (view) pendingView = view;
  await showWhenReady();
  return root;
}

export function closeFinder() {
  if (!root) return;
  const el = root;
  root = null;
  document.removeEventListener('keydown', onKey);
  el.classList.remove('df-open');
  setTimeout(() => el.remove(), 180);
}

window.dockfolioFinder = { open: openFinder, close: closeFinder, reload: reloadData };

/* ---------- Sambungan ke situs Framer ---------- */

// Ikon Finder di dock dikenali dari gambar ikonnya. Varian tombolnya berganti
// (D-Small ↔ D-Large) saat dock membesar di bawah kursor, jadi jangan bergantung pada nama varian.
const DOCK_FINDER = '[data-framer-name="Dock Menu"] a';
const DOCK_FINDER_IMG = 'jHPLi4pph6s8pBdTePue1xYLs';

function dockFinderTarget(el) {
  const a = el.closest?.(DOCK_FINDER);
  return a && a.querySelector(`img[src*="${DOCK_FINDER_IMG}"]`) ? a : null;
}

function installHooks() {
  let swallowClick = false;
  const opts = { capture: true };

  const block = e => { e.stopPropagation(); e.stopImmediatePropagation(); };

  window.addEventListener('pointerdown', e => {
    swallowClick = false;
    if (root?.contains(e.target)) return;
    if (dockFinderTarget(e.target)) { block(e); e.preventDefault(); }
  }, opts);

  window.addEventListener('pointerup', e => {
    if (root?.contains(e.target)) return;
    if (dockFinderTarget(e.target)) {
      block(e); e.preventDefault();
      swallowClick = true;
      openFinder();
    }
  }, opts);

  window.addEventListener('click', e => {
    if (root?.contains(e.target)) return;
    if (swallowClick || dockFinderTarget(e.target)) {
      swallowClick = false;
      block(e); e.preventDefault();
    }
  }, opts);
}

if (IS_MAIN_SITE) {
  installHooks();
  // Ambil data begitu halaman dimuat, supaya jeda bangun database tidak terasa saat Finder diklik.
  ensureData().catch(() => { /* ditampilkan saat Finder dibuka */ });
}

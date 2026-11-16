// Ikon desktop dari database (proyek, folder, foto, file) + posisi app Framer.
// Ikon portofolio asli Framer disembunyikan di site-overrides.css; lapisan ini menggantikannya.
import { loadData, openFinder } from '../finder/finder.js';
import { layoutFor, placeAll, savedPos, toFraction } from './desktop-model.js';
import { installTerminal } from '../terminal/terminal.js';

const SITE_ROOT = new URL('../', import.meta.url);
const CANVAS = '[data-framer-name="Drag Canvas"]';
const TAP_SLOP = 4;

/** Gambar ikon bawaan template untuk folder & PDF. */
export const ICONS = {
  folder: 'assets/framerusercontent.com/images/xcAZXvycXLEM6VfdZo2ALUmbXA.0vek3j5.png',
  file: 'assets/framerusercontent.com/images/9cfxMslKp7wgNJ0hdiODATzZQ.0vek3j5.png',
};

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Path lokal ("assets/…") dihitung dari root situs; URL Framer dikecilkan secukupnya. */
export function assetUrl(src, px = 256) {
  if (!src) return '';
  try {
    const u = new URL(src, SITE_ROOT);
    if (u.hostname === 'framerusercontent.com') u.searchParams.set('scale-down-to', String(px));
    return u.href;
  } catch {
    return '';
  }
}

/* ---------- State ---------- */

export const desktop = {
  items: [],
  layer: null,
  /** Diisi edit.js: klik sekali memilih, klik dua kali membuka. */
  editMode: false,
  hooks: {
    /** (item, layout, {x,y}) setelah ikon digeser. */
    moved: null,
    /** (event, item|null) klik kanan pada ikon / area kosong. */
    contextmenu: null,
  },
  render,
  openItem,
  layout: () => layoutFor(innerWidth),
  /** Posisi (pecahan) ikon di layout sekarang, termasuk yang ditaruh otomatis. */
  positions: new Map(),
};
window.dockfolioDesktop = desktop;

let z = 10;
let dragging = false;
let pendingRender = false;

/* ---------- Mount ---------- */

function canvas() {
  return document.querySelector(CANVAS);
}

function ensureLayer() {
  const host = canvas();
  if (!host) return null;
  if (desktop.layer?.isConnected && desktop.layer.parentElement === host) return desktop.layer;
  const layer = desktop.layer ?? document.createElement('div');
  layer.id = 'dk-layer';
  host.appendChild(layer);
  if (!desktop.layer) {
    desktop.layer = layer;
    wireLayer(layer);
  }
  return layer;
}

/* ---------- Render ---------- */

function iconHtml(it, pos) {
  const style = `left:${(pos.x * 100).toFixed(3)}%;top:${(pos.y * 100).toFixed(3)}%`;
  let art;
  if (it.kind === 'project' || it.kind === 'photo') {
    art = it.img
      ? `<span class="dk-frame"><img src="${esc(assetUrl(it.img))}" alt="" draggable="false" loading="lazy" decoding="async"></span>`
      : '<span class="dk-frame dk-frame-empty"></span>';
  } else {
    art = `<img class="dk-sym" src="${esc(assetUrl(ICONS[it.kind] ?? ICONS.file))}" alt="" draggable="false">`;
  }
  return `<div class="dk-icon dk-${it.kind}" data-id="${esc(it.id)}" role="button" tabindex="0" style="${style}" title="${esc(it.label)}">
    ${art}<span class="dk-label">${esc(it.label)}</span></div>`;
}

/** CSS posisi app Framer (per layout), dipasang di <head>. */
function appStyles(items) {
  const rule = (it, x, y) =>
    `${CANVAS} .${CSS.escape(it.ref)}{left:${(x * 100).toFixed(3)}% !important;top:${(y * 100).toFixed(3)}% !important}`;
  const d = [], m = [];
  for (const it of items) {
    if (it.kind !== 'app' || !/^framer-[\w-]+-container$/.test(it.ref)) continue;
    const pd = savedPos(it, 'd');
    const pm = savedPos(it, 'm');
    if (pd) d.push(rule(it, pd.x, pd.y));
    if (pm) m.push(rule(it, pm.x, pm.y));
  }
  return `@media (min-width:810px){${d.join('')}}@media (max-width:809.98px){${m.join('')}}`;
}

function applyAppStyles() {
  let el = document.getElementById('dk-app-pos');
  if (!el) {
    el = document.createElement('style');
    el.id = 'dk-app-pos';
    document.head.appendChild(el);
  }
  el.textContent = appStyles(desktop.items);
}

export function render() {
  if (dragging) { pendingRender = true; return; } // jangan ganti ikon yang sedang digeser
  pendingRender = false;
  applyAppStyles();
  const layer = ensureLayer();
  if (!layer) return;
  const layout = desktop.layout();
  const icons = desktop.items.filter(it => it.kind !== 'app');
  const { width, height } = layer.getBoundingClientRect();
  desktop.positions = placeAll(icons, layout, width || innerWidth, height || innerHeight);
  const selected = layer.querySelector('.dk-selected')?.dataset.id;
  layer.innerHTML = icons.map(it => iconHtml(it, desktop.positions.get(it.id))).join('');
  if (selected) layer.querySelector(`[data-id="${CSS.escape(selected)}"]`)?.classList.add('dk-selected');
}

/* ---------- Buka ikon ---------- */

export function openItem(it) {
  if (!it) return;
  if (it.kind === 'project') return openFinder({ type: 'project', id: it.ref });
  if (it.kind === 'folder') return openFinder({ type: 'category', id: it.ref });
  if (it.kind === 'file' && it.ref === 'resume') return openFinder({ type: 'resume' });
  if (it.kind === 'photo' || it.kind === 'file') return quickLook(it);
}

let ql = null;
function closeQuickLook() {
  ql?.remove();
  ql = null;
  document.removeEventListener('keydown', qlKey);
}
function qlKey(e) { if (e.key === 'Escape') closeQuickLook(); }

export function quickLook(it) {
  closeQuickLook();
  const src = assetUrl(it.src, 2048);
  const body = !src
    ? '<div class="dk-ql-empty">File belum tersedia</div>'
    : it.kind === 'photo'
      ? `<img src="${esc(src)}" alt="${esc(it.label)}">`
      : `<iframe src="${esc(src)}" title="${esc(it.label)}"></iframe>`;
  ql = document.createElement('div');
  ql.id = 'dk-ql';
  ql.setAttribute('role', 'dialog');
  ql.setAttribute('aria-label', it.label);
  ql.innerHTML = `
    <div class="dk-ql-bar">
      <button class="dk-ql-close" aria-label="Tutup"></button>
      <span class="dk-ql-title">${esc(it.label)}</span>
      ${src ? `<a class="dk-ql-open" href="${esc(src)}" target="_blank" rel="noopener">Buka ↗</a>` : ''}
    </div>
    <div class="dk-ql-body">${body}</div>`;
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'wheel', 'click']) {
    ql.addEventListener(t, e => e.stopPropagation());
  }
  ql.querySelector('.dk-ql-close').addEventListener('click', closeQuickLook);
  document.body.appendChild(ql);
  document.addEventListener('keydown', qlKey);
}

/* ---------- Interaksi ---------- */

const itemById = id => desktop.items.find(it => it.id === id);

function select(el) {
  for (const s of desktop.layer.querySelectorAll('.dk-selected')) if (s !== el) s.classList.remove('dk-selected');
  el?.classList.add('dk-selected');
}

function wireLayer(layer) {
  // Jangan sampai klik di ikon kita diteruskan ke Framer (dia bisa menggeser kanvas).
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart']) {
    layer.addEventListener(t, e => { if (e.target.closest('.dk-icon')) e.stopPropagation(); });
  }

  layer.addEventListener('pointerdown', e => {
    const el = e.target.closest('.dk-icon');
    if (!el || e.button !== 0 || el.querySelector('.dk-rename')) return;
    e.preventDefault();
    const it = itemById(el.dataset.id);
    const rect = layer.getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY, left: el.offsetLeft, top: el.offsetTop };
    let moved = false;
    dragging = true;
    el.setPointerCapture(e.pointerId);
    el.style.zIndex = String(++z);
    if (desktop.editMode) select(el);

    const move = ev => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < TAP_SLOP) return;
      moved = true;
      el.classList.add('dk-dragging');
      el.style.left = `${(toFraction(start.left + dx, rect.width) * 100).toFixed(3)}%`;
      el.style.top = `${(toFraction(start.top + dy, rect.height) * 100).toFixed(3)}%`;
    };
    const up = ev => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.classList.remove('dk-dragging');
      dragging = false;
      if (pendingRender) queueMicrotask(render);
      if (!moved) {
        if (!desktop.editMode && ev.type === 'pointerup') openItem(it);
        return;
      }
      const pos = {
        x: toFraction(el.offsetLeft, rect.width),
        y: toFraction(el.offsetTop, rect.height),
      };
      const layout = desktop.layout();
      if (layout === 'm') { it.mx = pos.x; it.my = pos.y; } else { it.x = pos.x; it.y = pos.y; }
      desktop.positions.set(it.id, pos);
      desktop.hooks.moved?.(it, layout, pos);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  });

  layer.addEventListener('dblclick', e => {
    const el = e.target.closest('.dk-icon');
    if (el && desktop.editMode && !el.querySelector('.dk-rename')) openItem(itemById(el.dataset.id));
  });

  layer.addEventListener('keydown', e => {
    const el = e.target.closest('.dk-icon');
    if (el && e.key === 'Enter' && !el.querySelector('.dk-rename')) openItem(itemById(el.dataset.id));
  });

  layer.addEventListener('contextmenu', e => {
    if (!desktop.hooks.contextmenu) return;
    const el = e.target.closest('.dk-icon');
    if (el) select(el);
    e.preventDefault();
    e.stopPropagation();
    desktop.hooks.contextmenu(e, el ? itemById(el.dataset.id) : null);
  });
}

/* ---------- Data ---------- */

function setData(data) {
  desktop.items = Array.isArray(data?.desktop) ? data.desktop : [];
  render();
}

let lastLayout = null;
function onResize() {
  const l = desktop.layout();
  if (l !== lastLayout) { lastLayout = l; render(); }
}

async function start() {
  window.addEventListener('dockfolio:data', e => setData(e.detail));
  let data;
  try {
    data = await loadData();
  } catch {
    return; // Finder yang menampilkan pesan gagal; desktop dibiarkan kosong
  }
  // Tunggu kanvas Framer ada (setelah hydrate).
  for (let i = 0; i < 100 && !canvas(); i++) await new Promise(r => setTimeout(r, 100));
  lastLayout = desktop.layout();
  setData(data);
  window.addEventListener('resize', onResize);
  // Framer bisa membangun ulang kanvasnya; pasang lagi lapisan kita kalau terlepas.
  // (lapisan dipindah apa adanya, tanpa digambar ulang, supaya geseran yang sedang berjalan tidak putus)
  setInterval(() => { if (!desktop.layer?.isConnected || desktop.layer.parentElement !== canvas()) ensureLayer(); }, 1500);

  const params = new URLSearchParams(location.search);
  if (params.has('edit')) {
    const res = await fetch('/api/admin/session', { cache: 'no-store' }).catch(() => null);
    if (res?.ok) {
      const { startEdit } = await import('./edit.js');
      startEdit(desktop);
    } else {
      location.href = '/admin/login';
    }
  }
}

if (!location.pathname.includes('/finder/')) {
  installTerminal(desktop); // ikon Terminal membuka terminal AI
  start();
}

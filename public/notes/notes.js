// App "Notes" di dock: menggantikan jendela Notes bawaan Framer (isinya dari CMS milik pembuat template)
// dengan jendela kita sendiri. Isi dari /api/finder: About (Profil admin) + kanvas Experience & Services.
import { loadData } from '../finder/finder.js';
import { renderDoc } from '../finder/doc-render.js';
import { renderAboutPage } from '../about/about-render.js';

const NOTES_ICON = 'aGhKhWRUl22CO8sj6d7qvmsTSBU'; // gambar ikon Notes di dock
const DOCK_LINK = '[data-framer-name="Dock Menu"] a';
const SITE_ROOT = new URL('../', import.meta.url);

const TABS = [
  { id: 'about', label: 'About me', icon: '<circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5c.6-2.4 2.6-3.7 5-3.7s4.4 1.3 5 3.7"/>' },
  { id: 'experience', label: 'Experience', icon: '<path d="m8 1.8 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z"/>' },
  { id: 'services', label: 'Services', icon: '<path d="M13.5 2.5 6 10M6 10c-1.5 0-3 1-3 3.5 1.8 0 3.5-.6 4-2.2M10.5 2.5l3 3"/>' },
];

let win = null;
let tab = 'about';
let hook = null;

/** Mode edit memasang editor di tab Experience/Services. fn(tabId, contentEl, data, winEl). */
export function setNotesHook(fn) { hook = fn; }

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const svg = (body, size = 15) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const asset = src => { try { return new URL(src, SITE_ROOT).href; } catch { return ''; } };
const initials = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

function contactIcons(contact) {
  const items = [];
  for (const l of contact?.links ?? []) {
    const label = l.label.toLowerCase();
    const short = label.includes('linkedin') ? 'in' : label.includes('instagram') ? 'ig'
      : label === 'x' || label.includes('twitter') ? '𝕏' : /phone|telp|whatsapp|wa/.test(label) ? '☎' : l.label.slice(0, 2);
    items.push(`<a href="${esc(l.url)}" target="_blank" rel="noopener" title="${esc(l.label)}" aria-label="${esc(l.label)}">${esc(short)}</a>`);
  }
  if (contact?.email) items.push(`<a href="mailto:${esc(contact.email)}" title="Email" aria-label="Email">@</a>`);
  return items.join('');
}

function header(data) {
  const a = data.about ?? {};
  const name = a.name || 'Portfolio';
  const avatar = a.avatar
    ? `<img class="nt-avatar" src="${esc(asset(a.avatar))}" alt="">`
    : `<span class="nt-avatar nt-initials" aria-hidden="true">${esc(initials(name))}</span>`;
  return `
    <div class="nt-head">
      ${avatar}
      <div class="nt-who"><b>${esc(name)}</b><span>${esc(a.role ?? '')}</span></div>
      <div class="nt-links">${contactIcons(data.contact)}</div>
    </div>`;
}

function body(data) {
  if (tab === 'about') return renderAboutPage(data);
  const doc = data.notes?.[tab];
  const html = doc ? renderDoc(doc, src => `<img src="${esc(asset(src))}" alt="" loading="lazy">`) : '';
  return `<div class="nt-doc" data-tab="${tab}">${html || '<p class="nt-empty">Belum ada isi.</p>'}</div>`;
}

async function render() {
  if (!win) return;
  const content = win.querySelector('.nt-content');
  let data;
  try {
    data = await loadData();
  } catch {
    content.innerHTML = '<p class="nt-empty">Data belum bisa dimuat. Tutup lalu buka lagi.</p>';
    return;
  }
  for (const b of win.querySelectorAll('[data-tab-btn]')) b.setAttribute('aria-current', b.dataset.tabBtn === tab ? 'page' : 'false');
  // Tab About me punya kop sendiri (judul besar), jadi kop Notes tidak ditampilkan di sana.
  content.innerHTML = (tab === 'about' ? '' : header(data)) + body(data);
  content.scrollTop = 0;
  hook?.(tab, content, data, win);
}

export function openNotes(which = tab) {
  tab = which;
  if (win?.isConnected) { render(); return; }
  win = document.createElement('div');
  win.id = 'nt-win';
  win.className = 'nt-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Notes');
  win.innerHTML = `
    <div class="nt-bar">
      <div class="nt-lights"><button class="nt-close" aria-label="Tutup"></button><span></span><span></span></div>
      <span class="nt-title">Notes</span>
    </div>
    <div class="nt-main">
      <nav class="nt-side">
        <div class="nt-side-label">About</div>
        ${TABS.map(t => `<button data-tab-btn="${t.id}">${svg(t.icon)}<span>${t.label}</span></button>`).join('')}
      </nav>
      <div class="nt-content"></div>
    </div>`;
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'wheel', 'keydown', 'contextmenu']) {
    win.addEventListener(t, e => e.stopPropagation());
  }
  win.querySelector('.nt-close').addEventListener('click', closeNotes);
  win.addEventListener('click', e => {
    const b = e.target.closest('[data-tab-btn]');
    if (b && b.dataset.tabBtn !== tab) { tab = b.dataset.tabBtn; render(); }
  });
  win.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !e.target.closest?.('[contenteditable="true"], input, textarea')) closeNotes();
  });
  drag(win.querySelector('.nt-bar'));
  document.body.appendChild(win);
  if (innerWidth > 700) {
    win.style.left = `${Math.max(0, (innerWidth - win.offsetWidth) / 2)}px`;
    win.style.top = `${Math.max(40, (innerHeight - win.offsetHeight) / 2 - 20)}px`;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => win?.classList.add('nt-open')));
  render();
}

export function closeNotes() {
  if (!win) return;
  const el = win;
  win = null;
  hook?.(null, null, null, null); // beri tahu mode edit: simpan & lepas editor
  el.classList.remove('nt-open');
  setTimeout(() => el.remove(), 160);
}

function drag(bar) {
  let start = null;
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || innerWidth <= 700) return;
    const r = win.getBoundingClientRect();
    start = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
    bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', e => {
    if (!start || !win) return;
    win.style.left = `${Math.min(Math.max(start.left + e.clientX - start.x, 0), innerWidth - win.offsetWidth)}px`;
    win.style.top = `${Math.min(Math.max(start.top + e.clientY - start.y, 0), innerHeight - 44)}px`;
  });
  const end = () => { start = null; };
  bar.addEventListener('pointerup', end);
  bar.addEventListener('pointercancel', end);
}

/** Klik ikon Notes di dock membuka jendela kita, bukan jendela Framer. */
export function installNotes() {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('notes.css', import.meta.url).href;
  document.head.appendChild(css);

  const target = el => {
    const a = el.closest?.(DOCK_LINK);
    return a && a.querySelector(`img[src*="${NOTES_ICON}"]`) ? a : null;
  };
  const block = e => { e.stopPropagation(); e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); };
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend']) {
    window.addEventListener(t, e => { if (target(e.target)) block(e); }, { capture: true, passive: false });
  }
  window.addEventListener('click', e => {
    if (!target(e.target)) return;
    block(e);
    openNotes();
  }, { capture: true });
  window.dockfolioNotes = { open: openNotes, close: closeNotes };
}

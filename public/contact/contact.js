// App "Contact" di dock: menggantikan jendela Contact bawaan Framer (email/telepon dari CMS milik
// pembuat template) dengan jendela kita. Data dari Profil admin; formulir dikirim ke /api/contact (menu Pesan).
import { loadData } from '../finder/finder.js';

const CONTACT_ICON = 'GDtwfDWvA44HAxAwR3Zp0UYLnRU'; // gambar ikon Contact di dock
const DOCK_LINK = '[data-framer-name="Dock Menu"] a';
const ICON_SRC = new URL('../assets/framerusercontent.com/images/GDtwfDWvA44HAxAwR3Zp0UYLnRU.0vek3j5.png', import.meta.url).href;

let win = null;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** "tel:+6285156019065" → "+62 851-5601-9065" (tampilan saja). */
function prettyPhone(url) {
  const n = url.replace(/^tel:/, '');
  const m = /^\+62(\d{3})(\d{4})(\d{3,5})$/.exec(n);
  return m ? `+62 ${m[1]}-${m[2]}-${m[3]}` : n;
}

function rows(contact) {
  const out = [];
  if (contact?.email) out.push(['Email', `<a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>`]);
  for (const l of contact?.links ?? []) {
    const text = l.url.startsWith('tel:') ? prettyPhone(l.url) : l.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const label = /^phone$/i.test(l.label) ? 'Phone Number' : l.label;
    out.push([label, `<a href="${esc(l.url)}"${l.url.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(text)}</a>`]);
  }
  return out.map(([k, v]) => `<div class="ct-row"><span>${esc(k)}:</span><div>${v}</div></div>`).join('');
}

async function render() {
  const content = win?.querySelector('.ct-content');
  if (!content) return;
  const data = await loadData().catch(() => null);
  content.innerHTML = `
    <div class="ct-head">
      <img src="${esc(ICON_SRC)}" alt="" width="48" height="48">
      <div><b>Contact</b><span>Open to projects, collabs, or concepts — let’s bring ideas alive.</span></div>
    </div>
    <div class="ct-rows">${data ? rows(data.contact) : '<p class="nt-empty">Data belum bisa dimuat.</p>'}</div>
    <form class="ct-form" novalidate>
      <div class="ct-form-title">Get In Touch:</div>
      <label><span>Name <i>*</i></span><input name="Name" required maxlength="200" placeholder="Enter your name" autocomplete="name"></label>
      <label><span>Email <i>*</i></span><input name="Email" type="email" required maxlength="200" placeholder="Enter your email" autocomplete="email"></label>
      <label><span>Message</span><textarea name="Message" rows="5" maxlength="5000" placeholder="Enter your message"></textarea></label>
      <p class="ct-msg" role="status"></p>
      <button type="submit">Get in touch</button>
    </form>`;
  content.querySelector('.ct-form').addEventListener('submit', submit);
}

async function submit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const msg = form.querySelector('.ct-msg');
  const btn = form.querySelector('button');
  const name = form.Name.value.trim();
  const email = form.Email.value.trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.textContent = 'Please fill in your name and a valid email.';
    msg.dataset.kind = 'error';
    return;
  }
  btn.disabled = true;
  msg.textContent = 'Sending…';
  msg.dataset.kind = '';
  try {
    const res = await fetch('/api/contact', { method: 'POST', body: new FormData(form) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error?.message ?? 'Could not send. Please try again.');
    form.reset();
    msg.textContent = 'Thank you! Your message has been sent.';
    msg.dataset.kind = 'ok';
  } catch (err) {
    msg.textContent = err.message;
    msg.dataset.kind = 'error';
  } finally {
    btn.disabled = false;
  }
}

export function openContact() {
  if (win?.isConnected) return;
  win = document.createElement('div');
  win.id = 'ct-win';
  win.className = 'nt-window ct-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Contact');
  win.innerHTML = `
    <div class="nt-bar">
      <div class="nt-lights"><button class="nt-close" aria-label="Tutup"></button><span></span><span></span></div>
      <span class="nt-title">Contact</span>
    </div>
    <div class="ct-content"></div>`;
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'wheel', 'keydown', 'contextmenu']) {
    win.addEventListener(t, e => e.stopPropagation());
  }
  win.querySelector('.nt-close').addEventListener('click', closeContact);
  win.addEventListener('keydown', e => { if (e.key === 'Escape' && !e.target.closest?.('input, textarea')) closeContact(); });
  dragBy(win.querySelector('.nt-bar'));
  document.body.appendChild(win);
  if (innerWidth > 700) {
    win.style.left = `${Math.max(0, (innerWidth - win.offsetWidth) / 2)}px`;
    win.style.top = `${Math.max(40, (innerHeight - win.offsetHeight) / 2 - 20)}px`;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => win?.classList.add('nt-open')));
  render();
}

export function closeContact() {
  if (!win) return;
  const el = win;
  win = null;
  el.classList.remove('nt-open');
  setTimeout(() => el.remove(), 160);
}

function dragBy(bar) {
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

/** Klik ikon Contact di dock membuka jendela kita, bukan jendela Framer. */
export function installContact() {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('contact.css', import.meta.url).href;
  document.head.appendChild(css);
  const target = el => {
    const a = el.closest?.(DOCK_LINK);
    return a && a.querySelector(`img[src*="${CONTACT_ICON}"]`) ? a : null;
  };
  const block = e => { e.stopPropagation(); e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); };
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend']) {
    window.addEventListener(t, e => { if (target(e.target)) block(e); }, { capture: true, passive: false });
  }
  window.addEventListener('click', e => {
    if (!target(e.target)) return;
    block(e);
    openContact();
  }, { capture: true });
  // Tombol "Book a Call" di halaman About (kalau belum ada link booking) membuka app Contact.
  // (fase capture: jendela Notes/Finder menghentikan event klik di dalamnya supaya tidak sampai ke Framer)
  document.addEventListener('click', e => {
    if (!e.target.closest?.('[data-ab-book]')) return;
    e.preventDefault();
    openContact();
  }, true);
  window.dockfolioContact = { open: openContact, close: closeContact };
}

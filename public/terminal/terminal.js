// AI Terminal: menggantikan jendela Terminal bawaan Framer dengan terminal AI yang bisa
// ditanya tentang pemilik portofolio. Jawaban di-stream dari POST /api/ai.
import { loadData } from '../finder/finder.js';

const FALLBACK_REF = 'framer-jbsg02-container'; // container app "Terminal" di ekspor Framer
const SPIN = ['✳', '✶', '✻', '✽', '✻', '✶'];

let desktop = null;
let win = null;
let busy = false;
let controller = null;
/** Percakapan tetap ada selama halaman terbuka, walau jendela ditutup lalu dibuka lagi. */
const history = [];
let logHtml = '';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Teks jawaban → HTML aman: **tebal**, `kode`, dan link http(s) bisa diklik. */
function format(text) {
  return esc(text)
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/(https?:\/\/[^\s<)"']+[^\s<)"'.,;:!?])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

/* ---------- Data ---------- */

async function info() {
  const data = await loadData().catch(() => null);
  const owner = data?.about?.name?.trim() || 'pemilik situs';
  return {
    owner,
    first: owner.split(/\s+/)[0],
    ai: data?.ai?.name || 'Portfolio AI',
    contact: data?.contact ?? { email: '', links: [] },
  };
}

/* ---------- Jendela ---------- */

const MASCOT = `<svg class="tm-mascot" viewBox="0 0 13 10" width="78" height="60" aria-hidden="true" shape-rendering="crispEdges">
  <rect x="6" y="0" width="1" height="1" fill="#0a64ff"/>
  <rect x="2" y="1" width="9" height="6" fill="#0a64ff"/>
  <rect x="3" y="2" width="7" height="4" fill="#0b1f4d"/>
  <rect x="4" y="3" width="1" height="2" fill="#7ee0ff"/>
  <rect x="8" y="3" width="1" height="2" fill="#7ee0ff"/>
  <rect x="0" y="3" width="2" height="2" fill="#0a64ff"/>
  <rect x="11" y="3" width="2" height="2" fill="#0a64ff"/>
  <rect x="3" y="7" width="2" height="1" fill="#0a64ff"/>
  <rect x="8" y="7" width="2" height="1" fill="#0a64ff"/>
  <rect x="2" y="8" width="3" height="1" fill="#0a64ff"/>
  <rect x="8" y="8" width="3" height="1" fill="#0a64ff"/>
</svg>`;

function welcome(i) {
  const tips = [
    `Siapa ${i.first}?`,
    'Proyek apa saja yang pernah dikerjakan?',
    `Bagaimana cara menghubungi ${i.first}?`,
  ];
  return `
    <div class="tm-welcome">
      ${MASCOT}
      <div>
        <div><b>${esc(i.ai)}</b> <span class="tm-muted">v1.0</span></div>
        <div class="tm-muted">Asisten AI · tanya apa saja tentang ${esc(i.owner)}</div>
        <div class="tm-muted">~/portfolio</div>
      </div>
    </div>
    <p class="tm-hello"><b>Halo! 👋 Aku asisten AI di portofolio ${esc(i.owner)}.</b></p>
    <p class="tm-muted">Ketik pertanyaan lalu tekan Enter. Ketik <b>/help</b> untuk perintah.</p>
    <div class="tm-tips">${tips.map(t => `<button class="tm-tip" data-q="${esc(t)}">› ${esc(t)}</button>`).join('')}</div>`;
}

async function openTerminal() {
  if (win?.isConnected) { win.querySelector('.tm-input').focus(); return; }
  const i = await info();
  win = document.createElement('div');
  win.id = 'tm-win';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', `Terminal — ${i.ai}`);
  win.innerHTML = `
    <div class="tm-bar">
      <div class="tm-lights">
        <button class="tm-light tm-close" aria-label="Tutup"></button>
        <span class="tm-light tm-min"></span><span class="tm-light tm-max"></span>
      </div>
      <div class="tm-title">📁 ${esc(i.first.toLowerCase())} — ✳ ${esc(i.ai)} — 80×24</div>
    </div>
    <div class="tm-body" tabindex="-1">
      ${welcome(i)}
      <div class="tm-log" aria-live="polite">${logHtml}</div>
    </div>
    <form class="tm-prompt" autocomplete="off">
      <span class="tm-caret">❯</span>
      <input class="tm-input" type="text" maxlength="1000" spellcheck="false"
        placeholder='Coba "Apa proyek terbaru ${esc(i.first)}?"' aria-label="Pertanyaan">
    </form>
    <div class="tm-foot"><span>◆ ${esc(i.ai)} · jawaban dari AI, bisa keliru</span><span>Esc untuk menutup</span></div>`;
  wire(win, i);
  document.body.appendChild(win);
  placeCenter();
  requestAnimationFrame(() => requestAnimationFrame(() => win?.classList.add('tm-open')));
  scrollEnd();
  win.querySelector('.tm-input').focus();
}

function closeTerminal() {
  if (!win) return;
  controller?.abort();
  const el = win;
  win = null;
  el.classList.remove('tm-open');
  setTimeout(() => el.remove(), 160);
}

function placeCenter() {
  if (innerWidth <= 700) return; // di HP diatur CSS
  const w = win.offsetWidth;
  const h = win.offsetHeight;
  win.style.left = `${Math.max(0, (innerWidth - w) / 2)}px`;
  win.style.top = `${Math.max(40, (innerHeight - h) / 2 - 20)}px`;
}

function scrollEnd() {
  const body = win?.querySelector('.tm-body');
  if (body) body.scrollTop = body.scrollHeight;
}

function wire(el, i) {
  // Semua interaksi di dalam terminal tidak boleh sampai ke Framer di belakangnya.
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'wheel', 'keydown', 'contextmenu']) {
    el.addEventListener(t, e => e.stopPropagation());
  }
  el.querySelector('.tm-close').addEventListener('click', closeTerminal);
  el.addEventListener('keydown', e => { if (e.key === 'Escape') closeTerminal(); });
  el.querySelector('.tm-body').addEventListener('click', e => {
    const tip = e.target.closest('.tm-tip');
    if (tip) ask(tip.dataset.q, i);
    else if (!getSelection()?.toString()) el.querySelector('.tm-input').focus();
  });
  el.querySelector('.tm-prompt').addEventListener('submit', e => {
    e.preventDefault();
    const input = el.querySelector('.tm-input');
    const q = input.value.trim();
    if (!q || busy) return;
    input.value = '';
    ask(q, i);
  });
  drag(el.querySelector('.tm-bar'), el);
}

function drag(bar, el) {
  let start = null;
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || innerWidth <= 700) return;
    const r = el.getBoundingClientRect();
    start = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
    bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', e => {
    if (!start) return;
    el.style.left = `${Math.min(Math.max(start.left + e.clientX - start.x, 0), innerWidth - el.offsetWidth)}px`;
    el.style.top = `${Math.min(Math.max(start.top + e.clientY - start.y, 0), innerHeight - 44)}px`;
  });
  const end = () => { start = null; };
  bar.addEventListener('pointerup', end);
  bar.addEventListener('pointercancel', end);
}

/* ---------- Percakapan ---------- */

function append(html) {
  const log = win?.querySelector('.tm-log');
  if (!log) return null;
  log.insertAdjacentHTML('beforeend', html);
  logHtml = log.innerHTML;
  scrollEnd();
  return log.lastElementChild;
}

function commit() {
  const log = win?.querySelector('.tm-log');
  if (log) logHtml = log.innerHTML;
}

function command(q, i) {
  const c = q.toLowerCase();
  if (c === '/clear') {
    history.length = 0;
    logHtml = '';
    win.querySelector('.tm-log').innerHTML = '';
    return true;
  }
  if (c === 'exit' || c === '/exit' || c === 'quit') { closeTerminal(); return true; }
  if (c === '/help') {
    append(`<div class="tm-q">❯ ${esc(q)}</div><div class="tm-sys">
      <div><b>/kontak</b>  cara menghubungi ${esc(i.first)}</div>
      <div><b>/clear</b>   mulai percakapan baru</div>
      <div><b>exit</b>     tutup terminal</div>
      <div class="tm-muted">Selain itu, tanya apa saja tentang ${esc(i.owner)}.</div></div>`);
    return true;
  }
  if (c === '/kontak' || c === '/contact') {
    const rows = [
      i.contact.email ? `<div>Email      <a href="mailto:${esc(i.contact.email)}">${esc(i.contact.email)}</a></div>` : '',
      ...(i.contact.links ?? []).map(l => `<div>${esc((l.label + ' ').padEnd(11, ' '))}<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.url)}</a></div>`),
    ].join('') || '<div class="tm-muted">Belum ada kontak.</div>';
    append(`<div class="tm-q">❯ ${esc(q)}</div><div class="tm-sys">${rows}</div>`);
    return true;
  }
  return false;
}

async function ask(q, i) {
  if (busy || !win) return;
  if (command(q, i)) return;
  busy = true;
  win.classList.add('tm-busy');
  append(`<div class="tm-q">❯ ${esc(q)}</div>`);
  const answer = append('<div class="tm-a"><span class="tm-dot">⏺</span><span class="tm-text"></span></div>');
  const text = answer.querySelector('.tm-text');
  const spinner = append('<div class="tm-spin"><span>✳</span> Berpikir…</div>');
  let f = 0;
  const timer = setInterval(() => { if (spinner?.firstChild) spinner.firstChild.textContent = SPIN[f++ % SPIN.length]; }, 120);

  history.push({ role: 'user', content: q });
  let full = '';
  controller = new AbortController();
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
      signal: controller.signal,
    });
    if (!res.ok || !res.body) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Gagal menghubungi AI (${res.status}).`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      spinner?.remove();
      text.innerHTML = format(full);
      scrollEnd();
    }
    full += decoder.decode();
    if (!full.trim()) throw new Error('AI tidak memberi jawaban. Coba tanya lagi.');
    text.innerHTML = format(full);
    history.push({ role: 'assistant', content: full });
  } catch (err) {
    history.pop(); // pertanyaan yang gagal tidak ikut riwayat
    if (err.name !== 'AbortError') {
      answer.classList.add('tm-err');
      text.textContent = err.message || 'Terjadi kesalahan.';
    }
  } finally {
    clearInterval(timer);
    spinner?.remove();
    busy = false;
    controller = null;
    win?.classList.remove('tm-busy');
    commit();
    scrollEnd();
    win?.querySelector('.tm-input')?.focus();
  }
}

/* ---------- Pengait app Terminal milik Framer ---------- */

function terminalRef() {
  return desktop?.items?.find(it => it.kind === 'app' && /terminal/i.test(it.label))?.ref ?? FALLBACK_REF;
}

/**
 * Klik pada ikon Terminal membuka terminal AI, bukan jendela bawaan Framer.
 * Di mode edit, event asli dipegang edit.js (untuk menggeser); klik yang ia putar ulang
 * (event sintetis, isTrusted = false) yang membuka terminal.
 */
export function installTerminal(d) {
  desktop = d;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('terminal.css', import.meta.url).href;
  document.head.appendChild(css);

  const hit = e => {
    if (desktop.editMode && e.isTrusted) return false;
    return !!e.target.closest?.(`.${CSS.escape(terminalRef())}`);
  };
  const block = e => { e.stopPropagation(); e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); };
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend']) {
    window.addEventListener(t, e => { if (hit(e)) block(e); }, { capture: true, passive: false });
  }
  window.addEventListener('click', e => {
    if (!hit(e)) return;
    block(e);
    openTerminal();
  }, { capture: true });
  window.dockfolioTerminal = { open: openTerminal, close: closeTerminal };
}

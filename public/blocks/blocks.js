// App "Blockfall": game susun-balok buatan sendiri, menggantikan app "Space Shooter" bawaan Framer.
// Ikon & label app Framer diganti di tempat (posisi tetap bisa digeser dari mode edit).
const FALLBACK_REF = 'framer-22bmx-container';
const NAME = 'Blockfall';
const ICON = new URL('icon.svg', import.meta.url).href;
const COLS = 10;
const ROWS = 20;
const BEST_KEY = 'dockfolio-blockfall-best';

// Bentuk balok (matriks persegi supaya rotasi sederhana) dan warnanya.
const SHAPES = {
  I: { c: '#29b6e8', m: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
  O: { c: '#f2e21b', m: [[1, 1], [1, 1]] },
  T: { c: '#e0249b', m: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
  S: { c: '#22d13b', m: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
  Z: { c: '#e8141c', m: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
  J: { c: '#1a2fe0', m: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
  L: { c: '#f08a12', m: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] },
};
const LINE_SCORE = [0, 100, 300, 500, 800];

let desktop = null;
let win = null;
let game = null;

const readBest = () => { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } };
const saveBest = v => { try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* mode privat */ } };

const rotate = m => m[0].map((_, i) => m.map(r => r[i]).reverse());

/* ---------- Logika game ---------- */

function newGame() {
  return {
    board: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
    bag: [], piece: null, next: null,
    score: 0, lines: 0, level: 1, best: readBest(),
    state: 'ready', // ready | play | pause | over
    acc: 0, last: 0, raf: 0,
  };
}

function draw7(g) {
  if (!g.bag.length) {
    g.bag = Object.keys(SHAPES);
    for (let i = g.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [g.bag[i], g.bag[j]] = [g.bag[j], g.bag[i]];
    }
  }
  const k = g.bag.pop();
  return { k, m: SHAPES[k].m.map(r => [...r]), c: SHAPES[k].c, x: 0, y: 0 };
}

function spawn(g) {
  const p = g.next ?? draw7(g);
  g.next = draw7(g);
  p.x = Math.floor((COLS - p.m.length) / 2);
  p.y = p.k === 'I' ? -1 : 0;
  g.piece = p;
  if (collides(g, p.m, p.x, p.y)) gameOver(g);
}

function collides(g, m, x, y) {
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const bx = x + c, by = y + r;
      if (bx < 0 || bx >= COLS || by >= ROWS) return true;
      if (by >= 0 && g.board[by][bx]) return true;
    }
  }
  return false;
}

function move(g, dx, dy) {
  const p = g.piece;
  if (!p || collides(g, p.m, p.x + dx, p.y + dy)) return false;
  p.x += dx; p.y += dy;
  return true;
}

function turn(g) {
  const p = g.piece;
  if (!p || p.k === 'O') return;
  const m = rotate(p.m);
  for (const dx of [0, -1, 1, -2, 2]) { // geser sedikit kalau mentok dinding
    if (!collides(g, m, p.x + dx, p.y)) { p.m = m; p.x += dx; return; }
  }
}

function lock(g) {
  const p = g.piece;
  p.m.forEach((row, r) => row.forEach((v, c) => {
    if (v && p.y + r >= 0) g.board[p.y + r][p.x + c] = p.c;
  }));
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (g.board[r].every(Boolean)) {
      g.board.splice(r, 1);
      g.board.unshift(Array(COLS).fill(null));
      cleared++; r++;
    }
  }
  if (cleared) {
    g.lines += cleared;
    g.score += LINE_SCORE[cleared] * g.level;
    g.level = 1 + Math.floor(g.lines / 10);
  }
  spawn(g);
}

function softDrop(g) {
  if (move(g, 0, 1)) g.score += 1; else lock(g);
}

function hardDrop(g) {
  let n = 0;
  while (move(g, 0, 1)) n++;
  g.score += n * 2;
  lock(g);
}

function ghostY(g) {
  const p = g.piece;
  let y = p.y;
  while (!collides(g, p.m, p.x, y + 1)) y++;
  return y;
}

function gameOver(g) {
  g.state = 'over';
  g.piece = null;
  if (g.score > g.best) { g.best = g.score; saveBest(g.best); }
}

const speed = g => Math.max(80, 800 - (g.level - 1) * 70); // ms per baris

/* ---------- Gambar ---------- */

const EMPTY = '#2b2b2b';

/** Hex → rgb yang digeser terang (+) / gelap (-). */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

/** Warna bayangan tempat jatuh: versi sangat gelap dari warna balok (tetap hex). */
const ghostOf = hex => '#' + [16, 8, 0].map(sh => Math.round(((parseInt(hex.slice(1), 16) >> sh) & 255) * .3 + 0x2b * .55).toString(16).padStart(2, '0')).join('');

/** Satu kotak bergaya timbul: sisi atas/kiri terang, bawah/kanan gelap, muka mengkilap. */
function cell(ctx, x, y, s, color, opts = {}) {
  const px = x * s, py = y * s, b = Math.max(2, s * .13);
  const empty = color === EMPTY;
  ctx.globalAlpha = opts.alpha ?? 1;
  const poly = (fill, pts) => { ctx.fillStyle = fill; ctx.beginPath(); pts.forEach(([u, v], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, px + u, py + v)); ctx.closePath(); ctx.fill(); };
  poly(shade(color, empty ? .12 : .55), [[0, 0], [s, 0], [s - b, b], [b, b]]);           // atas
  poly(shade(color, empty ? .06 : .3), [[0, 0], [b, b], [b, s - b], [0, s]]);             // kiri
  poly(shade(color, empty ? -.55 : -.5), [[0, s], [b, s - b], [s - b, s - b], [s, s]]);   // bawah
  poly(shade(color, empty ? -.4 : -.3), [[s, 0], [s, s], [s - b, s - b], [s - b, b]]);    // kanan
  const gr = ctx.createLinearGradient(0, py + b, 0, py + s - b);
  gr.addColorStop(0, shade(color, empty ? .02 : .18));
  gr.addColorStop(1, shade(color, empty ? -.12 : -.12));
  ctx.fillStyle = gr;
  ctx.fillRect(px + b, py + b, s - 2 * b, s - 2 * b);
  ctx.strokeStyle = 'rgba(0,0,0,.85)';
  ctx.lineWidth = 1;
  ctx.strokeRect(px + .5, py + .5, s - 1, s - 1);
  if (opts.active) { ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.strokeRect(px + .5, py + .5, s - 1, s - 1); }
  ctx.globalAlpha = 1;
}

function paint() {
  if (!win || !game) return;
  const g = game;
  const cv = win.querySelector('.bf-board');
  const ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const s = cv.clientWidth / COLS;
  if (cv.width !== Math.round(cv.clientWidth * dpr)) {
    cv.width = Math.round(cv.clientWidth * dpr);
    cv.height = Math.round(cv.clientHeight * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
  g.board.forEach((row, y) => row.forEach((c, x) => cell(ctx, x, y, s, c || EMPTY)));
  const p = g.piece;
  if (p && g.state !== 'over') {
    const gy = ghostY(g);
    p.m.forEach((row, r) => row.forEach((v, c) => {
      if (!v) return;
      if (gy + r >= 0 && gy !== p.y) cell(ctx, p.x + c, gy + r, s, ghostOf(p.c));
      if (p.y + r >= 0) cell(ctx, p.x + c, p.y + r, s, p.c, { active: true });
    }));
  }

  const nv = win.querySelector('.bf-next');
  const nctx = nv.getContext('2d');
  const ns = nv.clientHeight / 2;
  if (nv.width !== Math.round(nv.clientWidth * dpr)) { nv.width = Math.round(nv.clientWidth * dpr); nv.height = Math.round(nv.clientHeight * dpr); }
  nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  nctx.clearRect(0, 0, nv.clientWidth, nv.clientHeight);
  if (g.next) {
    const m = g.next.m;
    const rows = m.filter(r => r.some(Boolean));
    const w = Math.max(...m.map(r => r.lastIndexOf(1) - r.indexOf(1) + 1).filter(n => n > 0));
    const minC = Math.min(...m.map(r => r.indexOf(1)).filter(n => n >= 0));
    const ox = (nv.clientWidth / ns - w) / 2 - minC, oy = (2 - rows.length) / 2;
    rows.forEach((row, r) => row.forEach((v, c) => { if (v) cell(nctx, c + ox, r + oy, ns, g.next.c); }));
  }

  win.querySelector('[data-v="score"]').textContent = g.score.toLocaleString('en-US');
  win.querySelector('[data-v="lines"]').textContent = g.lines;
  win.querySelector('[data-v="level"]').textContent = g.level;
  win.querySelector('[data-act="pause"]').disabled = g.state !== 'play';
  win.querySelector('[data-act="start"].bf-round').disabled = g.state === 'play';
  const overlay = win.querySelector('.bf-overlay');
  const msg = { ready: ['Blockfall', `Best ${g.best.toLocaleString('en-US')} · Space or ▶ to start`], pause: ['Paused', 'Press P to resume'], over: ['Game over', `Score ${g.score.toLocaleString('en-US')} · Best ${Math.max(g.best, g.score).toLocaleString('en-US')}`] }[g.state];
  overlay.hidden = !msg;
  if (msg) {
    overlay.querySelector('b').textContent = msg[0];
    overlay.querySelector('span').textContent = msg[1];
    overlay.querySelector('button').textContent = g.state === 'pause' ? 'Resume' : g.state === 'over' ? 'Play again' : 'Start';
  }
}

function loop(t) {
  const g = game;
  if (!g || !win) return;
  if (g.state === 'play') {
    g.acc += t - (g.last || t);
    while (g.acc >= speed(g) && g.state === 'play') { g.acc -= speed(g); if (!move(g, 0, 1)) lock(g); }
  }
  g.last = t;
  paint();
  g.raf = requestAnimationFrame(loop);
}

function start() {
  if (game.state === 'pause') { game.state = 'play'; game.last = 0; return; }
  if (game.state === 'play') return;
  const best = readBest();
  game = Object.assign(newGame(), { best, state: 'play' });
  spawn(game);
}

function act(a) {
  const g = game;
  if (!g) return;
  if (a === 'start') return start();
  if (a === 'pause') { if (g.state === 'play') g.state = 'pause'; else if (g.state === 'pause') start(); return; }
  if (g.state !== 'play') return;
  if (a === 'left') move(g, -1, 0);
  else if (a === 'right') move(g, 1, 0);
  else if (a === 'down') softDrop(g);
  else if (a === 'rotate') turn(g);
  else if (a === 'drop') hardDrop(g);
}

const KEYS = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down', ArrowUp: 'rotate',
  KeyX: 'rotate', KeyZ: 'rotate', Space: 'drop', KeyP: 'pause', Escape: 'close',
};

/* ---------- Jendela ---------- */

export function openBlocks() {
  if (win?.isConnected) return;
  game = newGame();
  win = document.createElement('div');
  win.id = 'bf-win';
  win.className = 'nt-window bf-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', NAME);
  win.tabIndex = -1;
  const pad = (a, label, svg) => `<button type="button" data-act="${a}" aria-label="${label}">${svg}</button>`;
  const arrow = d => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  win.innerHTML = `
    <div class="nt-bar">
      <div class="nt-lights"><button class="nt-close" aria-label="Tutup"></button><span></span><span></span></div>
      <span class="nt-title">${NAME}</span>
    </div>
    <div class="bf-hud">
      <canvas class="bf-next" aria-label="Balok berikutnya"></canvas>
      <div class="bf-stats">
        <span>Score: <b data-v="score">0</b></span>
        <span>Level: <b data-v="level">1</b></span>
        <span>Lines: <b data-v="lines">0</b></span>
      </div>
      <button type="button" class="bf-round" data-act="start" aria-label="Main"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg></button>
      <button type="button" class="bf-round" data-act="pause" aria-label="Jeda"><svg width="16" height="16" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg></button>
    </div>
    <div class="bf-well">
      <canvas class="bf-board" aria-label="Papan permainan"></canvas>
      <div class="bf-overlay"><b></b><span></span><button type="button" data-act="start"></button></div>
    </div>
    <div class="bf-pad">
      ${pad('left', 'Kiri', arrow('M15 6l-6 6 6 6'))}
      ${pad('rotate', 'Putar', arrow('M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4'))}
      ${pad('down', 'Turun', arrow('M6 9l6 6 6-6'))}
      ${pad('right', 'Kanan', arrow('M9 6l6 6-6 6'))}
      ${pad('drop', 'Jatuhkan', arrow('M6 6l6 6 6-6M6 13l6 6 6-6'))}
    </div>`;
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'wheel', 'keydown', 'contextmenu']) {
    win.addEventListener(t, e => e.stopPropagation());
  }
  win.querySelector('.nt-close').addEventListener('click', closeBlocks);
  win.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (b) { act(b.dataset.act); win.focus({ preventScroll: true }); }
  });
  // Tombol layar sentuh: tahan untuk mengulang (kiri/kanan/turun).
  let rep = 0;
  win.querySelector('.bf-pad').addEventListener('pointerdown', e => {
    const b = e.target.closest('[data-act]');
    if (!b || !['left', 'right', 'down'].includes(b.dataset.act)) return;
    clearInterval(rep);
    rep = setTimeout(() => { rep = setInterval(() => act(b.dataset.act), 60); }, 220);
  });
  for (const t of ['pointerup', 'pointercancel', 'pointerleave']) win.querySelector('.bf-pad').addEventListener(t, () => { clearTimeout(rep); clearInterval(rep); });
  win.addEventListener('keydown', e => {
    const a = KEYS[e.code];
    if (!a) return;
    e.preventDefault();
    if (a === 'close') return closeBlocks();
    if (a === 'drop' && game.state !== 'play') return act('start');
    act(a);
  });
  drag(win.querySelector('.nt-bar'));
  document.body.appendChild(win);
  if (innerWidth > 700) {
    win.style.left = `${Math.max(0, (innerWidth - win.offsetWidth) / 2)}px`;
    win.style.top = `${Math.max(40, (innerHeight - win.offsetHeight) / 2 - 20)}px`;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => win?.classList.add('nt-open')));
  win.focus({ preventScroll: true });
  game.raf = requestAnimationFrame(loop);
}

export function closeBlocks() {
  if (!win) return;
  cancelAnimationFrame(game?.raf);
  if (game && game.score > game.best) saveBest(game.score);
  const el = win;
  win = null;
  game = null;
  el.classList.remove('nt-open');
  setTimeout(() => el.remove(), 160);
}

function drag(bar) {
  let s = null;
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || innerWidth <= 700) return;
    const r = win.getBoundingClientRect();
    s = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
    bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', e => {
    if (!s || !win) return;
    win.style.left = `${Math.min(Math.max(s.left + e.clientX - s.x, 0), innerWidth - win.offsetWidth)}px`;
    win.style.top = `${Math.min(Math.max(s.top + e.clientY - s.y, 0), innerHeight - 44)}px`;
  });
  const end = () => { s = null; };
  bar.addEventListener('pointerup', end);
  bar.addEventListener('pointercancel', end);
}

/* ---------- Ikon di desktop ---------- */

const appItem = () => desktop?.items?.find(it => it.kind === 'app' && (it.id === 'app-space-shooter' || it.ref === FALLBACK_REF));
const appRef = () => appItem()?.ref ?? FALLBACK_REF;

/** Ganti gambar & label app Framer jadi Blockfall (diulang kalau Framer menggambar ulang). */
function reskin() {
  const label = appItem()?.label || NAME;
  for (const box of document.querySelectorAll(`.${CSS.escape(appRef())}`)) {
    for (const img of box.querySelectorAll('img')) {
      if (img.getAttribute('src') !== ICON) { img.removeAttribute('srcset'); img.src = ICON; img.alt = label; }
    }
    for (const p of box.querySelectorAll('p')) if (p.textContent !== label) p.textContent = label;
  }
}

export function installBlocks(d) {
  desktop = d;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('blocks.css', import.meta.url).href;
  document.head.appendChild(css);

  reskin();
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; reskin(); });
  }).observe(document.body, { childList: true, subtree: true });

  // Sama seperti Terminal: di mode edit event asli dipakai untuk menggeser; klik putar-ulang yang membuka.
  const hit = e => {
    if (desktop.editMode && e.isTrusted) return false;
    return !!e.target.closest?.(`.${CSS.escape(appRef())}`);
  };
  const block = e => { e.stopPropagation(); e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); };
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend']) {
    window.addEventListener(t, e => { if (hit(e)) block(e); }, { capture: true, passive: false });
  }
  window.addEventListener('click', e => {
    if (!hit(e)) return;
    block(e);
    openBlocks();
  }, { capture: true });
  window.dockfolioBlocks = { open: openBlocks, close: closeBlocks };
}

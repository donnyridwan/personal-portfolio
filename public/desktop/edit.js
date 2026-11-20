// Mode edit admin: situs yang sama dengan pengunjung, tapi ikon bisa digeser (tersimpan),
// ditambah, diganti nama, dan dihapus — seperti mengelola file di komputer.
// Dimuat oleh desktop.js hanya kalau ?edit ada dan /api/admin/session = 200. Semua tulis dicek di server.
import { currentView, finderRoot, loadData, openFinder, reloadData, setRenderHook } from '../finder/finder.js';
import { esc } from './desktop.js';
import { setNotesHook } from '../notes/notes.js';
import { kindForFile, toFraction } from './desktop-model.js';

const MAX_BYTES = 10 * 1024 * 1024;
const TAP_SLOP = 4;

let desktop = null;
let data = null;

/* ---------- API ---------- */

async function api(method, path, body) {
  const res = await fetch(`/api/admin/${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const out = await res.json().catch(() => ({}));
  if (res.status === 401) {
    location.href = '/admin/login';
    throw new Error('Sesi habis, silakan login lagi.');
  }
  if (!res.ok) throw new Error(out.error ?? `Gagal (${res.status})`);
  return out;
}

async function refresh() {
  data = await reloadData();
  return data;
}

/** Jalankan aksi; kalau gagal tampilkan pesan. */
async function run(fn, busy) {
  if (busy) toast(busy, 0);
  try {
    const out = await fn();
    if (busy) hideToast();
    return out;
  } catch (err) {
    toast(err.message || 'Terjadi kesalahan', 4000, true);
    return undefined;
  }
}

/* ---------- Upload ke Cloudinary ---------- */

async function uploadFile(file, folder) {
  const kind = kindForFile(file.type);
  if (!kind) throw new Error(`"${file.name}" bukan gambar (JPG/PNG/WebP/GIF) atau PDF.`);
  if (file.size > MAX_BYTES) throw new Error(`"${file.name}" lebih dari 10 MB.`);
  const sign = await api('POST', 'cloudinary-signature', { folder });
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('folder', sign.folder);
  form.append('signature', sign.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, { method: 'POST', body: form });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out.secure_url) throw new Error(out.error?.message ?? `Upload "${file.name}" gagal`);
  return { url: out.secure_url, kind, name: file.name };
}

/** Upload beberapa file dengan progres di toast; file yang gagal dilaporkan, sisanya tetap jalan. */
async function uploadAll(files, folder) {
  const done = [];
  const errors = [];
  for (const [i, f] of files.entries()) {
    toast(files.length > 1 ? `Mengunggah ${i + 1}/${files.length}…` : `Mengunggah ${f.name}…`, 0);
    try {
      done.push(await uploadFile(f, folder));
    } catch (err) {
      errors.push(err.message);
    }
  }
  if (errors.length) toast(errors.join(' '), 5000, true);
  else hideToast();
  return done;
}

function pickFiles(accept = 'image/jpeg,image/png,image/webp,image/gif,application/pdf') {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = accept;
    input.addEventListener('change', () => resolve([...input.files]));
    input.click();
  });
}

const baseName = name => name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Proyek Baru';

/* ---------- UI kecil: toast, menu, dialog ---------- */

let toastEl = null;
let toastTimer = 0;
function toast(msg, ms = 2500, error = false) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'dk-toast';
    toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.toggle('dk-toast-error', error);
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  if (ms) toastTimer = setTimeout(hideToast, ms);
}
function hideToast() { if (toastEl) toastEl.hidden = true; }

let menuEl = null;
function closeMenu() {
  menuEl?.remove();
  menuEl = null;
}

/** items: [{ label, action, danger?, disabled? } | '-'] */
function showMenu(x, y, items) {
  closeMenu();
  menuEl = document.createElement('div');
  menuEl.id = 'dk-menu';
  menuEl.setAttribute('role', 'menu');
  menuEl.innerHTML = items.map((it, i) => it === '-'
    ? '<div class="dk-menu-sep" role="separator"></div>'
    : `<button role="menuitem" data-i="${i}" class="${it.danger ? 'dk-danger' : ''}" ${it.disabled ? 'disabled' : ''}>${esc(it.label)}</button>`).join('');
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'contextmenu']) {
    menuEl.addEventListener(t, e => { e.stopPropagation(); if (t === 'contextmenu') e.preventDefault(); });
  }
  menuEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    const it = items[Number(b.dataset.i)];
    closeMenu();
    it.action();
  });
  document.body.appendChild(menuEl);
  const r = menuEl.getBoundingClientRect();
  menuEl.style.left = `${Math.min(x, innerWidth - r.width - 6)}px`;
  menuEl.style.top = `${Math.min(y, innerHeight - r.height - 6)}px`;
  menuEl.querySelector('button:not(:disabled)')?.focus();
}

/** Dialog satu isian (pengganti prompt()). Resolve string, atau null kalau batal. */
function askText(title, value = '', okLabel = 'Simpan') {
  return new Promise(resolve => {
    const wrap = document.createElement('div');
    wrap.id = 'dk-dialog';
    wrap.innerHTML = `
      <form class="dk-dialog-box" role="dialog" aria-label="${esc(title)}">
        <label><span>${esc(title)}</span><input type="text" value="${esc(value)}" required></label>
        <div class="dk-dialog-actions">
          <button type="button" data-act="cancel">Batal</button>
          <button type="submit" class="dk-primary">${esc(okLabel)}</button>
        </div>
      </form>`;
    for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown']) {
      wrap.addEventListener(t, e => e.stopPropagation());
    }
    const input = wrap.querySelector('input');
    const done = v => { wrap.remove(); resolve(v); };
    wrap.querySelector('form').addEventListener('submit', e => { e.preventDefault(); done(input.value.trim() || null); });
    wrap.querySelector('[data-act="cancel"]').addEventListener('click', () => done(null));
    wrap.addEventListener('keydown', e => { if (e.key === 'Escape') done(null); });
    document.body.appendChild(wrap);
    input.focus();
    input.select();
  });
}

/* ---------- Jendela "Edit Detail" (form admin dalam iframe) ---------- */

let panel = null;
function closePanel() {
  if (!panel) return;
  panel.remove();
  panel = null;
  refresh().catch(() => {});
}

function openPanel(url, title) {
  if (panel) panel.remove();
  panel = document.createElement('div');
  panel.id = 'dk-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', title);
  panel.innerHTML = `
    <div class="dk-panel-bar">
      <button class="dk-panel-close" aria-label="Tutup"></button>
      <span class="dk-panel-title">${esc(title)}</span>
      <a href="${esc(url)}" target="_blank" rel="noopener">Buka di tab baru ↗</a>
    </div>
    <iframe src="${esc(url)}" title="${esc(title)}"></iframe>`;
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'wheel', 'touchstart', 'contextmenu']) {
    panel.addEventListener(t, e => e.stopPropagation());
  }
  panel.querySelector('.dk-panel-close').addEventListener('click', closePanel);
  document.body.appendChild(panel);
}

window.addEventListener('message', e => {
  if (e.origin === location.origin && e.data?.type === 'dockfolio:done') closePanel();
});

const editProject = id => openPanel(`/admin/projects/${encodeURIComponent(id)}`, 'Edit Detail Proyek');

/* ---------- Bilah mode edit ---------- */

function editBar() {
  const bar = document.createElement('div');
  bar.id = 'dk-editbar';
  bar.title = 'Seret ikon untuk memindah · klik kanan untuk menambah · seret file ke desktop untuk upload';
  bar.innerHTML = `
    <span class="dk-editbar-dot"></span>
    <strong>Mode Edit</strong>
    <button data-act="panel">Panel</button>
    <a href="/">Pratinjau</a>
    <a href="/admin/logout">Keluar</a>`;
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click']) bar.addEventListener(t, e => e.stopPropagation());
  bar.querySelector('[data-act="panel"]').addEventListener('click', () => openPanel('/admin/projects', 'Panel Admin'));
  document.body.appendChild(bar);
}

/* ---------- Desktop: ganti nama di tempat ---------- */

function renameInline(item) {
  const el = desktop.layer?.querySelector(`.dk-icon[data-id="${CSS.escape(item.id)}"]`);
  if (!el) return;
  const label = el.querySelector('.dk-label');
  const input = document.createElement('textarea');
  input.className = 'dk-rename';
  input.value = item.label;
  input.rows = 1;
  label.replaceWith(input);
  input.focus();
  input.select();
  let finished = false;
  const finish = async save => {
    if (finished) return;
    finished = true;
    const name = input.value.trim();
    if (!save || !name || name === item.label) {
      input.replaceWith(label);
      return;
    }
    label.textContent = name;
    input.replaceWith(label);
    await run(async () => {
      if (item.kind === 'project') await api('PATCH', `projects/${encodeURIComponent(item.ref)}`, { name });
      else if (item.kind === 'folder') await api('PATCH', `categories/${encodeURIComponent(item.ref)}`, { label: name });
      else await api('PATCH', `desktop/${encodeURIComponent(item.id)}`, { label: name });
    });
    await refresh();
  };
  input.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Enter') { e.preventDefault(); finish(true); }
    if (e.key === 'Escape') { e.preventDefault(); finish(false); }
  });
  input.addEventListener('blur', () => finish(true));
  for (const t of ['pointerdown', 'pointerup', 'click', 'dblclick']) input.addEventListener(t, e => e.stopPropagation());
}

async function renameAfterCreate(desktopId) {
  if (!desktopId) return;
  const it = desktop.items.find(i => i.id === desktopId);
  if (it) renameInline(it);
}

/* ---------- Desktop: aksi ---------- */

/** Titik (pecahan) dari posisi mouse di atas lapisan desktop. */
function pointAt(clientX, clientY) {
  const r = desktop.layer.getBoundingClientRect();
  return {
    x: toFraction(clientX - r.left, r.width),
    y: toFraction(clientY - r.top, r.height),
    layout: desktop.layout(),
  };
}

async function newFolder(pt) {
  const out = await run(() => api('POST', 'categories', { desktop: pt }));
  if (!out) return;
  await refresh();
  renameAfterCreate(out.desktopId);
}

async function newProject(pt) {
  const out = await run(() => api('POST', 'projects', { desktop: pt }));
  if (!out) return;
  await refresh();
  renameAfterCreate(out.desktopId);
}

/** Upload file ke desktop di sekitar titik pt (beberapa file disusun ke bawah). */
async function uploadToDesktop(files, pt) {
  if (!files.length) return;
  const uploaded = await uploadAll(files, 'dockfolio/desktop');
  const r = desktop.layer.getBoundingClientRect();
  for (const [i, f] of uploaded.entries()) {
    const y = Math.min(0.95, pt.y + (i * 116) / r.height);
    await run(() => api('POST', 'desktop', { kind: f.kind, label: f.name, src: f.url, x: pt.x, y, layout: pt.layout }));
  }
  if (uploaded.length) {
    await refresh();
    toast(uploaded.length > 1 ? `${uploaded.length} file ditambahkan` : `${uploaded[0].name} ditambahkan`);
  }
}

async function deleteItem(item) {
  const msg = {
    project: `Hapus proyek "${item.label}"? Proyek hilang dari desktop dan Finder. Ini tidak bisa dibatalkan.`,
    folder: `Hapus folder "${item.label}"? Proyek di dalamnya tetap ada, hanya dilepas dari folder ini.`,
  }[item.kind] ?? `Hapus "${item.label}" dari desktop?`;
  if (!confirm(msg)) return;
  await run(() => {
    if (item.kind === 'project') return api('DELETE', `projects/${encodeURIComponent(item.ref)}`);
    if (item.kind === 'folder') return api('DELETE', `categories/${encodeURIComponent(item.ref)}`);
    return api('DELETE', `desktop/${encodeURIComponent(item.id)}`);
  }, 'Menghapus…');
  await refresh();
}

async function removeFromDesktop(item) {
  const path = item.kind === 'project' ? 'projects' : 'categories';
  await run(() => api('PATCH', `${path}/${encodeURIComponent(item.ref)}`, { onDesktop: false }));
  await refresh();
}

function desktopMenu(e, item) {
  if (!item) {
    const pt = pointAt(e.clientX, e.clientY);
    return showMenu(e.clientX, e.clientY, [
      { label: 'Folder Baru', action: () => newFolder(pt) },
      { label: 'Proyek Baru', action: () => newProject(pt) },
      { label: 'Upload Foto/File…', action: async () => uploadToDesktop(await pickFiles(), pt) },
      '-',
      { label: 'Profil (About, Kontak, Resume)…', action: () => openPanel('/admin/profile', 'Profil') },
      { label: 'Panel Admin…', action: () => openPanel('/admin/projects', 'Panel Admin') },
    ]);
  }
  const open = { label: 'Buka', action: () => desktop.openItem(item) };
  const rename = { label: 'Ganti Nama', action: () => renameInline(item) };
  if (item.kind === 'project') {
    return showMenu(e.clientX, e.clientY, [
      open, rename,
      { label: 'Edit Detail…', action: () => editProject(item.ref) },
      '-',
      { label: 'Hapus dari Desktop', action: () => removeFromDesktop(item) },
      { label: 'Hapus Proyek…', danger: true, action: () => deleteItem(item) },
    ]);
  }
  if (item.kind === 'folder') {
    return showMenu(e.clientX, e.clientY, [
      open, rename, '-',
      { label: 'Hapus dari Desktop', action: () => removeFromDesktop(item) },
      { label: 'Hapus Folder…', danger: true, action: () => deleteItem(item) },
    ]);
  }
  if (item.kind === 'file' && item.ref === 'resume') {
    return showMenu(e.clientX, e.clientY, [
      open, rename,
      { label: 'Ganti Resume…', action: () => openPanel('/admin/profile', 'Profil') },
    ]);
  }
  return showMenu(e.clientX, e.clientY, [open, rename, '-', { label: 'Hapus', danger: true, action: () => deleteItem(item) }]);
}

async function savePosition(item, layout, pos) {
  await run(() => api('PATCH', `desktop/${encodeURIComponent(item.id)}`, { ...pos, layout }));
}

/* ---------- App Framer: geser & simpan posisi ---------- */

function installAppDrag() {
  const apps = () => desktop.items.filter(i => i.kind === 'app');
  const findApp = target => {
    for (const it of apps()) {
      const c = target.closest?.(`.${CSS.escape(it.ref)}`);
      if (c) return { it, c };
    }
    return null;
  };
  let drag = null;
  let swallowClick = false;
  let replaying = false; // klik yang kita putar ulang ke Framer
  const opts = { capture: true };
  const block = e => { e.stopPropagation(); e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); };

  /**
   * Di mode edit Framer tidak boleh melihat pointer di atas app sama sekali (kalau ia menerima
   * pointerdown tanpa pointerup, app-nya ikut kursor). Kalau ternyata cuma klik, klik itu
   * diputar ulang ke Framer supaya app tetap terbuka seperti biasa.
   */
  function replayTap(target, x, y) {
    replaying = true;
    const base = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, button: 0, pointerId: 1, isPrimary: true, pointerType: 'mouse' };
    try {
      target.dispatchEvent(new PointerEvent('pointerdown', { ...base, buttons: 1 }));
      target.dispatchEvent(new MouseEvent('mousedown', { ...base, buttons: 1 }));
      target.dispatchEvent(new PointerEvent('pointerup', { ...base, buttons: 0 }));
      target.dispatchEvent(new MouseEvent('mouseup', { ...base, buttons: 0 }));
      target.dispatchEvent(new MouseEvent('click', { ...base, buttons: 0 }));
    } finally {
      replaying = false;
    }
  }

  window.addEventListener('pointerdown', e => {
    if (replaying) return;
    swallowClick = false;
    if (e.button !== 0) return;
    const hit = findApp(e.target);
    if (!hit) return;
    block(e);
    const host = hit.c.offsetParent ?? hit.c.parentElement;
    drag = { ...hit, target: e.target, host, x: e.clientX, y: e.clientY, left: hit.c.offsetLeft, top: hit.c.offsetTop, moved: false };
  }, opts);

  window.addEventListener('pointermove', e => {
    if (!drag || replaying) return;
    block(e);
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < TAP_SLOP) return;
    drag.moved = true;
    const w = drag.host.clientWidth || innerWidth;
    const h = drag.host.clientHeight || innerHeight;
    drag.c.style.setProperty('left', `${(toFraction(drag.left + dx, w) * 100).toFixed(3)}%`, 'important');
    drag.c.style.setProperty('top', `${(toFraction(drag.top + dy, h) * 100).toFixed(3)}%`, 'important');
  }, opts);

  const end = e => {
    if (!drag || replaying) return;
    const d = drag;
    drag = null;
    block(e);
    swallowClick = true; // klik asli setelah ini ditahan (yang dipakai hanya klik putar ulang)
    if (!d.moved) {
      if (e.type === 'pointerup') replayTap(d.target, e.clientX, e.clientY);
      return;
    }
    const w = d.host.clientWidth || innerWidth;
    const h = d.host.clientHeight || innerHeight;
    const pos = { x: toFraction(d.c.offsetLeft, w), y: toFraction(d.c.offsetTop, h) };
    const layout = desktop.layout();
    if (layout === 'm') { d.it.mx = pos.x; d.it.my = pos.y; } else { d.it.x = pos.x; d.it.y = pos.y; }
    // Inline style dilepas; posisi tersimpan dipasang lewat CSS di desktop.js (per layout).
    d.c.style.removeProperty('left');
    d.c.style.removeProperty('top');
    desktop.render();
    savePosition(d.it, layout, pos);
  };
  window.addEventListener('pointerup', end, opts);
  window.addEventListener('pointercancel', end, opts);
  // Event mouse/touch bawaan (kompatibilitas) juga ditahan selama kita yang memegang app.
  for (const t of ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend']) {
    window.addEventListener(t, e => { if (drag && !replaying) block(e); }, { capture: true, passive: false });
  }
  window.addEventListener('click', e => {
    if (replaying) return;
    if (swallowClick) { swallowClick = false; block(e); }
  }, opts);
}

/* ---------- Finder: klik kanan & seret file ---------- */

const viewOf = el => { try { return JSON.parse(el.dataset.view); } catch { return null; } };
const onDesktop = (kind, ref) => desktop.items.some(i => i.kind === kind && i.ref === ref);
const projectById = id => data?.projects.find(p => p.id === id);
const categoryById = id => data?.categories.find(c => c.id === id);

function projectMenuItems(id) {
  const p = projectById(id);
  if (!p) return [];
  const shown = onDesktop('project', id);
  return [
    { label: 'Buka', action: () => openFinder({ type: 'project', id }) },
    { label: 'Ganti Nama…', action: async () => {
      const name = await askText('Nama proyek', p.name);
      if (name) { await run(() => api('PATCH', `projects/${encodeURIComponent(id)}`, { name })); await refresh(); }
    } },
    { label: 'Edit Detail…', action: () => editProject(id) },
    { label: 'Tambah Gambar…', action: async () => addImagesToProject(id, await pickFiles('image/jpeg,image/png,image/webp,image/gif')) },
    '-',
    shown
      ? { label: 'Hapus dari Desktop', action: async () => { await run(() => api('PATCH', `projects/${encodeURIComponent(id)}`, { onDesktop: false })); await refresh(); } }
      : { label: 'Tampilkan di Desktop', action: async () => { await run(() => api('PATCH', `projects/${encodeURIComponent(id)}`, { onDesktop: true })); await refresh(); } },
    { label: 'Hapus Proyek…', danger: true, action: () => deleteItem({ kind: 'project', ref: id, label: p.name }) },
  ];
}

function folderMenuItems(id) {
  const c = categoryById(id);
  if (!c) return [];
  const shown = onDesktop('folder', id);
  return [
    { label: 'Buka', action: () => openFinder({ type: 'category', id }) },
    { label: 'Proyek Baru di Folder Ini…', action: () => newProjectInFolder(id) },
    { label: 'Ganti Nama…', action: async () => {
      const label = await askText('Nama folder', c.label);
      if (label) { await run(() => api('PATCH', `categories/${encodeURIComponent(id)}`, { label })); await refresh(); }
    } },
    '-',
    shown
      ? { label: 'Hapus dari Desktop', action: async () => { await run(() => api('PATCH', `categories/${encodeURIComponent(id)}`, { onDesktop: false })); await refresh(); } }
      : { label: 'Tampilkan di Desktop', action: async () => { await run(() => api('PATCH', `categories/${encodeURIComponent(id)}`, { onDesktop: true })); await refresh(); } },
    { label: 'Hapus Folder…', danger: true, action: () => deleteItem({ kind: 'folder', ref: id, label: c.label }) },
  ];
}

async function newFolderInFinder() {
  const label = await askText('Nama folder baru', 'Folder Baru', 'Buat');
  if (!label) return;
  const out = await run(() => api('POST', 'categories', { label }));
  if (!out) return;
  await refresh();
  openFinder({ type: 'category', id: out.id });
}

async function newProjectInFolder(categoryId, images = []) {
  const name = await askText('Nama proyek baru', 'Proyek Baru', 'Buat');
  if (!name) return;
  const out = await run(() => api('POST', 'projects', { name, categories: [categoryId], images }));
  if (!out) return;
  await refresh();
  openFinder({ type: 'category', id: categoryId });
}

async function addImagesToProject(id, files) {
  if (!files.length) return;
  const up = (await uploadAll(files, `dockfolio/projects/${id}`)).filter(f => f.kind === 'photo');
  if (!up.length) return;
  await run(() => api('PATCH', `projects/${encodeURIComponent(id)}`, { addImages: up.map(f => f.url) }));
  await refresh();
  toast(`${up.length} gambar ditambahkan ke ${projectById(id)?.name ?? 'proyek'}`);
}

function finderContextMenu(e) {
  const root = finderRoot();
  if (!root?.contains(e.target)) return false;
  const row = e.target.closest('[data-view]');
  const view = row && viewOf(row);
  let items = null;
  if (view?.type === 'project') items = projectMenuItems(view.id);
  else if (view?.type === 'category') items = folderMenuItems(view.id);
  else if (e.target.closest('.df-sidebar')) items = [{ label: 'Folder Baru…', action: newFolderInFinder }];
  else if (e.target.closest('.df-content')) {
    const cur = currentView();
    if (cur?.type === 'category') {
      items = [
        { label: 'Proyek Baru…', action: () => newProjectInFolder(cur.id) },
        { label: 'Upload Gambar jadi Proyek Baru…', action: async () => {
          const files = await pickFiles('image/jpeg,image/png,image/webp,image/gif');
          if (files.length) dropIntoFinder(files);
        } },
      ];
    } else if (cur?.type === 'project') {
      items = projectMenuItems(cur.id);
    } else if (cur?.type === 'about' || cur?.type === 'contact' || cur?.type === 'resume') {
      items = [{ label: 'Edit Profil…', action: () => openPanel('/admin/profile', 'Profil') }];
    }
  }
  if (!items?.length) return false;
  e.preventDefault();
  e.stopPropagation();
  showMenu(e.clientX, e.clientY, items);
  return true;
}

/** File dijatuhkan ke Finder: ke proyek → tambah gambar; ke folder → proyek baru berisi gambar itu. */
async function dropIntoFinder(files) {
  const cur = currentView();
  const images = files.filter(f => kindForFile(f.type) === 'photo');
  if (!images.length) return toast('Hanya gambar (JPG, PNG, WebP, GIF) yang bisa ditambahkan ke proyek.', 4000, true);
  if (cur?.type === 'project') return addImagesToProject(cur.id, images);
  if (cur?.type === 'category') {
    const up = (await uploadAll(images, 'dockfolio/desktop')).map(f => f.url);
    if (!up.length) return;
    const name = baseName(images[0].name);
    const out = await run(() => api('POST', 'projects', { name, categories: [cur.id], images: up }));
    if (out) { await refresh(); toast(`Proyek "${out.name}" dibuat`); }
    return;
  }
  toast('Buka sebuah folder atau proyek di Finder dulu, lalu seret gambarnya ke sana.', 4000, true);
}

/* ---------- Seret file dari komputer ---------- */

function installDrop() {
  let hint = null;
  const hasFiles = e => [...(e.dataTransfer?.types ?? [])].includes('Files');
  const showHint = target => {
    const inFinder = finderRoot()?.contains(target);
    document.documentElement.classList.toggle('dk-drop-desktop', !inFinder);
    document.documentElement.classList.toggle('dk-drop-finder', !!inFinder);
  };
  const clear = () => document.documentElement.classList.remove('dk-drop-desktop', 'dk-drop-finder');
  window.addEventListener('dragover', e => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    showHint(e.target);
    clearTimeout(hint);
    hint = setTimeout(clear, 300);
  });
  window.addEventListener('drop', e => {
    if (!hasFiles(e) || e.defaultPrevented) return; // sudah ditangani editor kanvas
    e.preventDefault();
    clear();
    const files = [...e.dataTransfer.files];
    if (!files.length) return;
    if (finderRoot()?.contains(e.target)) dropIntoFinder(files);
    else if (!panel?.contains(e.target)) uploadToDesktop(files, pointAt(e.clientX, e.clientY));
  });
}

/* ---------- Kanvas (editor ala Notion): isi proyek di Finder & tab Notes ---------- */

const SAVE_DELAY = 900;
let editorModule = null;
// Satu kanvas per jendela: { save, onSaved, handle, timer, pending, saving, status }
let canvas = null;      // halaman proyek di Finder
let notesCanvas = null; // tab Experience / Services di Notes

function loadEditor() {
  // Bundel editor (public/editor/editor.js) hanya dimuat di mode edit.
  editorModule ??= import('../editor/editor.js');
  return editorModule;
}

function setStatus(c, text, kind = '') {
  if (!c?.status) return;
  c.status.textContent = text;
  c.status.dataset.kind = kind;
}

async function saveCanvas(c, { keepalive = false } = {}) {
  if (!c?.pending) return;
  clearTimeout(c.timer);
  const body = c.pending;
  c.pending = null;
  c.saving = true;
  setStatus(c, 'Menyimpan…');
  try {
    const res = await c.save(body, keepalive);
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error ?? `Gagal menyimpan (${res.status})`);
    c.onSaved(body); // tampilan berikutnya memakai isi terbaru
    if (!c.pending) setStatus(c, 'Tersimpan ✓', 'ok');
  } catch (err) {
    c.pending ??= body; // coba lagi pada perubahan berikutnya
    setStatus(c, `${err.message} — klik untuk coba lagi`, 'error');
  } finally {
    c.saving = false;
  }
}

function releaseCanvas(c) {
  if (!c) return;
  if (c.pending) saveCanvas(c, { keepalive: true });
  c.handle?.destroy();
  c.dead = true;
}

function closeCanvas() { releaseCanvas(canvas); canvas = null; }
function closeNotesCanvas() { releaseCanvas(notesCanvas); notesCanvas = null; }

/** Ganti docEl dengan editor. c: { save(body, keepalive), onSaved(body), status, initial, folder } */
async function attachEditor(c, docEl) {
  const host = document.createElement('div');
  host.className = 'ed-host';
  docEl.replaceWith(host);
  c.status?.addEventListener('click', () => { if (c.status.dataset.kind === 'error') saveCanvas(c); });
  let mod;
  try {
    mod = await loadEditor();
  } catch (err) {
    console.error('[edit] editor', err);
    host.replaceWith(docEl);
    setStatus(c, 'Editor gagal dimuat', 'error');
    return;
  }
  if (c.dead) return; // jendela/tampilan berganti saat editor dimuat
  c.handle = mod.mountEditor(host, {
    content: structuredClone(c.initial ?? { type: 'doc', content: [{ type: 'paragraph' }] }),
    onUpdate(json) {
      c.pending = json;
      setStatus(c, 'Belum tersimpan…');
      clearTimeout(c.timer);
      c.timer = setTimeout(() => saveCanvas(c), SAVE_DELAY);
    },
    async uploadImage(file) {
      toast(`Mengunggah ${file.name}…`, 0);
      try {
        const out = await uploadFile(file, c.folder);
        if (out.kind !== 'photo') throw new Error(`"${file.name}" bukan gambar.`);
        hideToast();
        return out.url;
      } catch (err) {
        toast(err.message, 4000, true);
        throw err;
      }
    },
    pickImages: () => pickFiles('image/jpeg,image/png,image/webp,image/gif'),
    onError: msg => toast(msg, 4000, true),
  });
  window.dockfolioCanvas = c.handle; // untuk debug/tes
  setStatus(c, c.initial && JSON.stringify(c.initial).length > 60 ? 'Tersimpan ✓' : 'Kanvas kosong — ketik "/"', 'ok');
}

const patchJson = (url, payload, keepalive) => fetch(url, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
  keepalive,
});

async function mountCanvas(view, content, finderData) {
  closeCanvas();
  if (view.type !== 'project') return;
  const docEl = content.querySelector('.df-doc[data-project]');
  const project = finderData.projects.find(p => p.id === view.id);
  if (!docEl || !project) return;

  // Kop: tombol untuk mengubah thumbnail/nama/klien/tahun/tag + status simpan.
  const head = content.querySelector('.df-detail-head');
  const tools = document.createElement('div');
  tools.className = 'ed-tools';
  tools.innerHTML = '<span class="ed-status" aria-live="polite"></span><button type="button" class="ed-kop">Edit kop…</button>';
  head?.appendChild(tools);
  const c = {
    initial: project.body,
    folder: `dockfolio/projects/${project.id}`,
    status: tools.querySelector('.ed-status'),
    save: (body, keepalive) => patchJson(`/api/admin/projects/${encodeURIComponent(project.id)}`, { body }, keepalive),
    onSaved: body => { project.body = body; },
  };
  canvas = c;
  tools.querySelector('.ed-kop').addEventListener('click', async () => {
    await saveCanvas(c);
    editProject(project.id);
  });
  await attachEditor(c, docEl);
}

/** Notes: About me → tombol ke form Profil; Experience/Services → kanvas. */
async function mountNotesCanvas(tab, content, notesData) {
  closeNotesCanvas();
  if (!tab || !content) return; // jendela Notes ditutup
  const head = content.querySelector('.nt-head');
  const tools = document.createElement('div');
  tools.className = 'ed-tools nt-tools';
  if (tab === 'about') {
    tools.innerHTML = '<span class="ed-status">Isi halaman About (judul, angka, pengalaman, testimoni) diubah di Profil.</span><button type="button" class="ed-kop">Edit profil…</button>';
    content.prepend(tools);
    tools.querySelector('.ed-kop').addEventListener('click', () => openPanel('/admin/profile', 'Profil'));
    return;
  }
  const docEl = content.querySelector('.nt-doc[data-tab]');
  if (!docEl) return;
  tools.innerHTML = '<span class="ed-status" aria-live="polite"></span>';
  head?.after(tools);
  notesData.notes ??= { experience: null, services: null };
  const c = {
    initial: notesData.notes[tab],
    folder: 'dockfolio/profile',
    status: tools.querySelector('.ed-status'),
    save: (body, keepalive) => patchJson('/api/admin/notes', { tab, body }, keepalive),
    onSaved: body => { notesData.notes[tab] = body; },
  };
  notesCanvas = c;
  await attachEditor(c, docEl);
}

/* ---------- Mulai ---------- */

export async function startEdit(d) {
  desktop = d;
  data = await loadData();
  desktop.editMode = true;
  document.documentElement.classList.add('dk-editing');
  desktop.hooks.moved = savePosition;
  desktop.hooks.contextmenu = desktopMenu;
  window.addEventListener('dockfolio:data', e => { data = e.detail; });
  setRenderHook((view, content, finderData) => { mountCanvas(view, content, finderData); });
  setNotesHook((tab, content, notesData) => { mountNotesCanvas(tab, content, notesData); });
  window.addEventListener('pagehide', () => {
    for (const c of [canvas, notesCanvas]) if (c?.pending) saveCanvas(c, { keepalive: true });
  });
  // Finder ditutup → simpan dan lepas editor.
  new MutationObserver(() => { if (canvas && !finderRoot()) closeCanvas(); })
    .observe(document.body, { childList: true });
  editBar();
  installAppDrag();
  installDrop();

  // Klik kanan di area kosong desktop (bukan di ikon kita, bukan di jendela).
  document.addEventListener('contextmenu', e => {
    if (finderContextMenu(e)) return;
    if (e.target.closest('#dk-layer .dk-icon, #dk-menu, #dk-panel, #dk-dialog, #dk-editbar, #dk-ql, input, textarea')) return;
    if (e.target.closest('[data-framer-name="Dock Menu"], nav')) return;
    if (!e.target.closest('[data-framer-name="Drag Canvas"]')) return;
    e.preventDefault();
    desktopMenu(e, null);
  }, true);

  // Klik di tempat lain menutup menu dan membatalkan pilihan ikon.
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('#dk-menu')) closeMenu();
    if (!e.target.closest('.dk-icon')) for (const s of document.querySelectorAll('.dk-icon.dk-selected')) s.classList.remove('dk-selected');
  }, true);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
    if (e.target.closest?.('input, textarea, [contenteditable]')) return;
    const sel = document.querySelector('#dk-layer .dk-icon.dk-selected');
    const item = sel && desktop.items.find(i => i.id === sel.dataset.id);
    if (!item) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteItem(item); }
    if (e.key === 'F2') { e.preventDefault(); renameInline(item); }
  });

  toast('Mode edit aktif', 2000);
}

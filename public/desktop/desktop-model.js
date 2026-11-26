// Logika desktop tanpa DOM, supaya bisa dites dengan `node --test`.

/** Breakpoint layout HP milik Framer. */
export const MOBILE_MAX = 809.98;

/** 'm' untuk layar HP (< 810 px), 'd' untuk lainnya. */
export const layoutFor = width => (width <= MOBILE_MAX ? 'm' : 'd');

/** Posisi tersimpan untuk layout ini, atau null. */
export function savedPos(item, layout) {
  const x = layout === 'm' ? item.mx : item.x;
  const y = layout === 'm' ? item.my : item.y;
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

/** Ukuran sel grid otomatis (px), kira-kira satu ikon + label. */
export const CELL = { w: 104, h: 116 };

/**
 * Posisi untuk ikon tanpa posisi tersimpan: sel kosong pertama di grid,
 * mulai dari kanan atas lalu turun, seperti ikon baru di desktop macOS.
 * Mengembalikan Map id → { x, y } (pecahan 0–1) untuk SEMUA item.
 */
export function placeAll(items, layout, width, height, top = 40) {
  const cols = Math.max(1, Math.floor(width / CELL.w));
  const rows = Math.max(1, Math.floor((height - top) / CELL.h));
  const cellOf = (x, y) => [
    Math.min(cols - 1, Math.floor((x * width) / CELL.w)),
    Math.min(rows - 1, Math.max(0, Math.floor((y * height - top) / CELL.h))),
  ];
  const taken = new Set();
  const out = new Map();
  for (const it of items) {
    const p = savedPos(it, layout);
    if (!p) continue;
    out.set(it.id, p);
    taken.add(cellOf(p.x, p.y).join(','));
  }
  let c = cols - 1;
  let r = 0;
  for (const it of items) {
    if (out.has(it.id)) continue;
    let guard = cols * rows;
    while (taken.has(`${c},${r}`) && guard-- > 0) {
      r++;
      if (r >= rows) { r = 0; c = c > 0 ? c - 1 : cols - 1; }
    }
    taken.add(`${c},${r}`);
    out.set(it.id, { x: ((c + 0.5) * CELL.w) / width, y: (top + (r + 0.5) * CELL.h) / height });
  }
  return out;
}

/** Pecahan 0–1 dari posisi piksel, dijaga tetap di layar. */
export const toFraction = (px, size) => Math.min(1, Math.max(0, px / size));

/** Jenis file dari tipe untuk upload: 'photo', 'video', 'file', atau null (ditolak). */
export function kindForFile(type) {
  if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type)) return 'photo';
  if (['video/mp4', 'video/webm', 'video/quicktime'].includes(type)) return 'video';
  if (type === 'application/pdf') return 'file';
  return null;
}

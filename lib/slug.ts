/** Nama → id aman untuk URL ("Café Ünïcode" → "cafe-unicode"). Kosong → "proyek". */
export function slugify(name: string): string {
  const s = name
    .replace(/[\u2122\u00ae\u00a9\u2120]/g, '') // merek dagang (NFKD mengubah TM-simbol jadi "TM")
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // tanda aksen
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'proyek';
}

/** "Folder Baru" → "Folder Baru 2" kalau nama itu sudah ada (tanpa beda huruf besar/kecil). */
export function uniqueName(base: string, existing: string[]): string {
  const taken = new Set(existing.map(s => s.trim().toLowerCase()));
  if (!taken.has(base.toLowerCase())) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base} ${n}`.toLowerCase())) return `${base} ${n}`;
}

/** "glaze" → "glaze-2" kalau id sudah dipakai. */
export function uniqueId(base: string, existing: string[]): string {
  const taken = new Set(existing);
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

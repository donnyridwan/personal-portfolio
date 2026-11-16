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

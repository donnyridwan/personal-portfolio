// Query admin (tulis/baca) ke Neon. Hanya dipanggil dari Server Action/halaman admin yang sudah requireAdmin().
import 'server-only';
import { loadSettings, sql } from './db';
import { validateDoc } from './blocks';
import { clampPos } from './desktop';
import { slugify, uniqueId, uniqueName } from './slug';
import type { CategoryRow, DesktopKind, ProjectRow, SettingsMap } from './types';

/** Kesalahan yang pesannya aman ditampilkan ke admin. */
export class UserError extends Error {}

export type ProjectInput = Omit<ProjectRow, 'featured_order' | 'sort'>;

const PROJECT_COLS = `id, name, client, year, summary, challenge, solution, final_thoughts, url, thumbnail,
  images, tags, categories, featured_color, featured_order, sort, body`;

/* ---------- Urutan ---------- */

type SortTable = 'projects' | 'categories';

/** Tulis ulang kolom sort jadi 0..n-1 sesuai urutan id yang diberikan. */
async function writeOrder(table: SortTable, ids: string[]) {
  await sql().query(
    `update ${table} as t set sort = v.n - 1
     from unnest($1::text[]) with ordinality as v(id, n) where t.id = v.id`,
    [ids],
  );
}

async function move(table: SortTable, id: string, dir: -1 | 1) {
  const rows = (await sql().query(`select id from ${table} order by sort, id`)) as { id: string }[];
  const ids = rows.map(r => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await writeOrder(table, ids);
}

/* ---------- Proyek ---------- */

export async function listProjects(): Promise<ProjectRow[]> {
  return (await sql().query(`select ${PROJECT_COLS} from projects order by sort, id`)) as ProjectRow[];
}

export async function getProjectRow(id: string): Promise<ProjectRow | null> {
  const rows = (await sql().query(`select ${PROJECT_COLS} from projects where id = $1`, [id])) as ProjectRow[];
  return rows[0] ?? null;
}

async function projectExists(id: string) {
  const rows = await sql()`select 1 from projects where id = ${id}`;
  return rows.length > 0;
}

/** Simpan proyek baru (originalId null) atau yang sudah ada. Mengembalikan id akhir. */
export async function saveProject(originalId: string | null, input: ProjectInput): Promise<string> {
  const name = input.name.trim();
  if (!name) throw new UserError('Nama proyek wajib diisi.');
  const id = slugify(input.id.trim() || name);
  if (id !== originalId && (await projectExists(id))) {
    throw new UserError(`ID "${id}" sudah dipakai proyek lain.`);
  }
  const db = sql();
  const color = input.featured_color || null;

  if (originalId === null) {
    await db`
      insert into projects (id, name, client, year, summary, challenge, solution, final_thoughts, url, thumbnail,
                            images, tags, categories, featured_color, featured_order, sort)
      values (${id}, ${name}, ${input.client}, ${input.year}, ${input.summary}, ${input.challenge}, ${input.solution},
              ${input.final_thoughts}, ${input.url}, ${input.thumbnail}, ${input.images}, ${input.tags},
              ${input.categories}, ${color},
              case when ${color}::text is null then null
                   else (select coalesce(max(featured_order), -1) + 1 from projects) end,
              (select coalesce(max(sort), -1) + 1 from projects))`;
    return id;
  }

  const rows = await db`
    update projects set
      id = ${id}, name = ${name}, client = ${input.client}, year = ${input.year},
      url = ${input.url}, thumbnail = ${input.thumbnail}, tags = ${input.tags},
      categories = ${input.categories}, featured_color = ${color},
      featured_order = case
        when ${color}::text is null then null
        when featured_order is not null then featured_order
        else (select coalesce(max(featured_order), -1) + 1 from projects) end,
      updated_at = now()
    where id = ${originalId}
    returning id`;
  if (!rows.length) throw new UserError('Proyek tidak ditemukan (mungkin sudah dihapus).');
  if (id !== originalId) {
    await db`update desktop_items set ref = ${id} where kind = 'project' and ref = ${originalId}`;
  }
  return id;
}

/** Hapus proyek beserta ikonnya di desktop. */
export async function deleteProject(id: string) {
  const db = sql();
  await db.transaction([
    db`delete from desktop_items where kind = 'project' and ref = ${id}`,
    db`delete from projects where id = ${id}`,
  ]);
}

/** Proyek baru cepat (dari desktop/Finder): nama & id dibuat unik otomatis. */
export async function createProjectQuick(opts: { name?: string; categories?: string[]; images?: string[] }) {
  const db = sql();
  const existing = (await db`select id, name from projects`) as { id: string; name: string }[];
  const name = uniqueName((opts.name ?? '').trim() || 'Proyek Baru', existing.map(p => p.name));
  const id = uniqueId(slugify(name), existing.map(p => p.id));
  const images = (opts.images ?? []).filter(Boolean);
  const cats = (opts.categories ?? []).filter(Boolean);
  await db`
    insert into projects (id, name, year, thumbnail, images, categories, sort)
    values (${id}, ${name}, ${new Date().getFullYear()}, ${images[0] ?? ''}, ${images}, ${cats},
            (select coalesce(max(sort), -1) + 1 from projects))`;
  return { id, name };
}

export async function renameProject(id: string, name: string) {
  const clean = name.trim();
  if (!clean) throw new UserError('Nama tidak boleh kosong.');
  const rows = await sql()`update projects set name = ${clean}, updated_at = now() where id = ${id} returning id`;
  if (!rows.length) throw new UserError('Proyek tidak ditemukan.');
}

/** Tambah gambar preview; jadi thumbnail juga kalau thumbnail masih kosong. */
export async function addProjectImages(id: string, urls: string[]) {
  const list = urls.filter(u => /^https?:\/\//.test(u));
  if (!list.length) return;
  // Kalau proyek sudah punya isi kanvas, gambar juga ditambahkan sebagai blok di akhir kanvas.
  const blocks = JSON.stringify(list.map(src => ({ type: 'image', attrs: { src, alt: '' } })));
  const rows = await sql()`
    update projects set images = images || ${list}::text[],
      thumbnail = case when thumbnail = '' then ${list[0]} else thumbnail end,
      body = case when body is null then null
                  else jsonb_set(body, '{content}', coalesce(body->'content', '[]'::jsonb) || ${blocks}::jsonb) end,
      updated_at = now()
    where id = ${id} returning id`;
  if (!rows.length) throw new UserError('Proyek tidak ditemukan.');
}

/** Simpan isi kanvas (dokumen blok) proyek. */
export async function saveProjectBody(id: string, input: unknown) {
  const doc = validateDoc(input);
  if (!doc) throw new UserError('Isi tidak valid atau terlalu besar.');
  const rows = await sql()`update projects set body = ${JSON.stringify(doc)}::jsonb, updated_at = now() where id = ${id} returning id`;
  if (!rows.length) throw new UserError('Proyek tidak ditemukan.');
}

export const moveProject = (id: string, dir: -1 | 1) => move('projects', id, dir);

/** Geser urutan di daftar Featured. */
export async function moveFeatured(id: string, dir: -1 | 1) {
  const rows = (await sql()`
    select id from projects where featured_color is not null
    order by featured_order nulls last, sort, id`) as { id: string }[];
  const ids = rows.map(r => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await sql().query(
    `update projects as t set featured_order = v.n - 1
     from unnest($1::text[]) with ordinality as v(id, n) where t.id = v.id`,
    [ids],
  );
}

/* ---------- Kategori ---------- */

export async function listCategories(): Promise<(CategoryRow & { used: number })[]> {
  return (await sql()`
    select c.id, c.label, c.sort,
           (select count(*)::int from projects p where c.id = any(p.categories)) as used
    from categories c order by c.sort, c.id`) as (CategoryRow & { used: number })[];
}

export async function addCategory(label: string): Promise<string> {
  const clean = label.trim();
  if (!clean) throw new UserError('Nama kategori wajib diisi.');
  const id = slugify(clean);
  const rows = await sql()`
    insert into categories (id, label, sort)
    values (${id}, ${clean}, (select coalesce(max(sort), -1) + 1 from categories))
    on conflict (id) do nothing
    returning id`;
  if (!rows.length) throw new UserError(`Kategori dengan ID "${id}" sudah ada.`);
  return id;
}

export async function renameCategory(id: string, label: string) {
  const clean = label.trim();
  if (!clean) throw new UserError('Nama kategori wajib diisi.');
  await sql()`update categories set label = ${clean} where id = ${id}`;
}

/** Folder baru cepat: nama "Folder Baru", "Folder Baru 2", … */
export async function addCategoryUnique(label?: string) {
  const db = sql();
  const existing = (await db`select id, label from categories`) as { id: string; label: string }[];
  const clean = uniqueName((label ?? '').trim() || 'Folder Baru', existing.map(c => c.label));
  const id = uniqueId(slugify(clean), existing.map(c => c.id));
  await db`insert into categories (id, label, sort)
           values (${id}, ${clean}, (select coalesce(max(sort), -1) + 1 from categories))`;
  return { id, label: clean };
}

/** Hapus kategori dan lepaskan dari semua proyek yang memakainya (ikon foldernya ikut hilang). */
export async function deleteCategory(id: string) {
  const db = sql();
  await db.transaction([
    db`delete from desktop_items where kind = 'folder' and ref = ${id}`,
    db`update projects set categories = array_remove(categories, ${id}), updated_at = now()
       where ${id} = any(categories)`,
    db`delete from categories where id = ${id}`,
  ]);
}

export const moveCategory = (id: string, dir: -1 | 1) => move('categories', id, dir);

/* ---------- Settings ---------- */

export const getSettings = (): Promise<SettingsMap> => loadSettings();

/** Simpan satu tab kanvas di app Notes (Experience / Services). */
export async function saveNotesDoc(tab: 'experience' | 'services', input: unknown) {
  const doc = validateDoc(input);
  if (!doc) throw new UserError('Isi tidak valid atau terlalu besar.');
  await sql()`
    insert into settings (key, value) values ('notes', jsonb_build_object(${tab}::text, ${JSON.stringify(doc)}::jsonb))
    on conflict (key) do update set value = settings.value || excluded.value`;
}

export async function saveSetting(key: 'about' | 'contact' | 'resume' | 'ai', value: unknown) {
  const json = JSON.stringify(value);
  await sql()`
    insert into settings (key, value) values (${key}, ${json}::jsonb)
    on conflict (key) do update set value = excluded.value`;
}

/* ---------- Desktop ---------- */

export type DesktopInput = {
  kind: DesktopKind;
  ref?: string;
  label?: string;
  src?: string;
  x?: unknown;
  y?: unknown;
  layout?: 'd' | 'm';
};

const KINDS: DesktopKind[] = ['project', 'folder', 'photo', 'file', 'app'];

export async function createDesktopItem(input: DesktopInput): Promise<string> {
  if (!KINDS.includes(input.kind) || input.kind === 'app') throw new UserError('Jenis ikon tidak dikenal.');
  const db = sql();
  const ref = String(input.ref ?? '');
  const src = String(input.src ?? '');
  if (input.kind === 'photo' || input.kind === 'file') {
    if (!/^https:\/\//.test(src)) throw new UserError('File harus berupa URL https.');
  } else {
    const table = input.kind === 'project' ? 'projects' : 'categories';
    const found = await db.query(`select 1 from ${table} where id = $1`, [ref]);
    if (!found.length) throw new UserError('Proyek/folder tidak ditemukan.');
    const dup = (await db`select id from desktop_items where kind = ${input.kind} and ref = ${ref}`) as { id: string }[];
    if (dup.length) return dup[0].id; // sudah ada di desktop
  }
  const x = clampPos(input.x);
  const y = clampPos(input.y);
  const mobile = input.layout === 'm';
  const rows = (await db`
    insert into desktop_items (kind, ref, label, src, x, y, mx, my, z)
    values (${input.kind}, ${ref}, ${String(input.label ?? '').trim()}, ${src},
            ${mobile ? null : x}, ${mobile ? null : y}, ${mobile ? x : null}, ${mobile ? y : null},
            (select coalesce(max(z), 0) + 1 from desktop_items))
    returning id`) as { id: string }[];
  return rows[0].id;
}

/** Simpan posisi (untuk layout 'd' atau 'm') dan bawa ke paling atas. */
export async function moveDesktopItem(id: string, x: unknown, y: unknown, layout: 'd' | 'm') {
  const cx = clampPos(x);
  const cy = clampPos(y);
  if (cx === null || cy === null) throw new UserError('Posisi tidak valid.');
  const db = sql();
  const rows = layout === 'm'
    ? await db`update desktop_items set mx = ${cx}, my = ${cy}, z = (select coalesce(max(z), 0) + 1 from desktop_items)
               where id = ${id} returning id`
    : await db`update desktop_items set x = ${cx}, y = ${cy}, z = (select coalesce(max(z), 0) + 1 from desktop_items)
               where id = ${id} returning id`;
  if (!rows.length) throw new UserError('Ikon tidak ditemukan.');
}

export async function renameDesktopItem(id: string, label: string) {
  const clean = label.trim();
  if (!clean) throw new UserError('Nama tidak boleh kosong.');
  await sql()`update desktop_items set label = ${clean} where id = ${id} and kind in ('photo', 'file', 'app')`;
}

export async function deleteDesktopItem(id: string) {
  await sql()`delete from desktop_items where id = ${id} and kind <> 'app'`;
}

export async function removeFromDesktop(kind: 'project' | 'folder', ref: string) {
  await sql()`delete from desktop_items where kind = ${kind} and ref = ${ref}`;
}

/* ---------- Kuota AI Terminal ---------- */

/**
 * Catat satu pertanyaan untuk pengunjung ini dan untuk total hari ini.
 * Mengembalikan 'ip' / 'global' kalau batasnya terlewati, 'ok' kalau boleh lanjut.
 */
export async function takeAiQuota(visitorKey: string, perVisitor: number, perDay: number): Promise<'ok' | 'ip' | 'global'> {
  const rows = (await sql()`
    insert into ai_usage (day, key, count)
    values (current_date, ${visitorKey}, 1), (current_date, '__all__', 1)
    on conflict (day, key) do update set count = ai_usage.count + 1
    returning key, count`) as { key: string; count: number }[];
  const of = (k: string) => rows.find(r => r.key === k)?.count ?? 0;
  if (of('__all__') > perDay) return 'global';
  if (of(visitorKey) > perVisitor) return 'ip';
  return 'ok';
}

/* ---------- Pesan dari formulir Contact ---------- */

export type ContactMessage = { id: number; created_at: string; name: string; email: string; message: string };

/** Simpan pesan; 'limit' kalau pengunjung ini sudah kirim 5 pesan dalam 1 jam atau total hari ini > 200. */
export async function saveContactMessage(
  m: { name: string; email: string; message: string; fields: Record<string, string> },
  visitor: string,
): Promise<'ok' | 'limit'> {
  const db = sql();
  const [{ mine, today }] = (await db`
    select count(*) filter (where visitor = ${visitor} and created_at > now() - interval '1 hour')::int as mine,
           count(*) filter (where created_at > now() - interval '1 day')::int as today
    from contact_messages`) as { mine: number; today: number }[];
  if (mine >= 5 || today >= 200) return 'limit';
  await db`insert into contact_messages (name, email, message, fields, visitor)
           values (${m.name}, ${m.email}, ${m.message}, ${JSON.stringify(m.fields)}::jsonb, ${visitor})`;
  return 'ok';
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  return (await sql()`select id, created_at, name, email, message from contact_messages order by created_at desc limit 500`) as ContactMessage[];
}

export async function deleteContactMessage(id: number) {
  await sql()`delete from contact_messages where id = ${id}`;
}

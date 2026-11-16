// Query admin (tulis/baca) ke Neon. Hanya dipanggil dari Server Action/halaman admin yang sudah requireAdmin().
import 'server-only';
import { loadSettings, sql } from './db';
import { slugify } from './slug';
import type { CategoryRow, ProjectRow, SettingsMap } from './types';

/** Kesalahan yang pesannya aman ditampilkan ke admin. */
export class UserError extends Error {}

export type ProjectInput = Omit<ProjectRow, 'featured_order' | 'sort'>;

const PROJECT_COLS = `id, name, client, year, summary, challenge, solution, final_thoughts, url, thumbnail,
  images, tags, categories, featured_color, featured_order, sort`;

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
      id = ${id}, name = ${name}, client = ${input.client}, year = ${input.year}, summary = ${input.summary},
      challenge = ${input.challenge}, solution = ${input.solution}, final_thoughts = ${input.final_thoughts},
      url = ${input.url}, thumbnail = ${input.thumbnail}, images = ${input.images}, tags = ${input.tags},
      categories = ${input.categories}, featured_color = ${color},
      featured_order = case
        when ${color}::text is null then null
        when featured_order is not null then featured_order
        else (select coalesce(max(featured_order), -1) + 1 from projects) end,
      updated_at = now()
    where id = ${originalId}
    returning id`;
  if (!rows.length) throw new UserError('Proyek tidak ditemukan (mungkin sudah dihapus).');
  return id;
}

export async function deleteProject(id: string) {
  await sql()`delete from projects where id = ${id}`;
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

/** Hapus kategori dan lepaskan dari semua proyek yang memakainya. */
export async function deleteCategory(id: string) {
  const db = sql();
  await db.transaction([
    db`update projects set categories = array_remove(categories, ${id}), updated_at = now()
       where ${id} = any(categories)`,
    db`delete from categories where id = ${id}`,
  ]);
}

export const moveCategory = (id: string, dir: -1 | 1) => move('categories', id, dir);

/* ---------- Settings ---------- */

export const getSettings = (): Promise<SettingsMap> => loadSettings();

export async function saveSetting(key: 'about' | 'contact' | 'resume', value: unknown) {
  const json = JSON.stringify(value);
  await sql()`
    insert into settings (key, value) values (${key}, ${json}::jsonb)
    on conflict (key) do update set value = excluded.value`;
}

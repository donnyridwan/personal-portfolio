// Koneksi Neon (HTTP, tanpa pool) — hanya dipakai di server.
import 'server-only';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { buildFinderData } from './finder-data';
import type { CategoryRow, FinderData, ProjectRow, SettingsMap } from './types';

let client: NeonQueryFunction<false, false> | null = null;

export function sql() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL belum diisi');
    client = neon(url);
  }
  return client;
}

export async function loadSettings(): Promise<SettingsMap> {
  const rows = (await sql()`select key, value from settings`) as { key: string; value: unknown }[];
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export async function loadFinderData(): Promise<FinderData> {
  const db = sql();
  const [categories, projects, settings] = await Promise.all([
    db`select id, label, sort from categories`,
    db`select id, name, client, year, summary, challenge, solution, final_thoughts, url, thumbnail,
              images, tags, categories, featured_color, featured_order, sort
       from projects`,
    loadSettings(),
  ]);
  return buildFinderData(categories as CategoryRow[], projects as ProjectRow[], settings);
}

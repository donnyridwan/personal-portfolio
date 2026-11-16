// Koneksi Neon (HTTP, tanpa pool) — hanya dipakai di server.
import 'server-only';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { aiSettingsFrom } from './ai';
import { buildDesktop } from './desktop';
import { buildFinderData } from './finder-data';
import type { CategoryRow, DesktopRow, FinderData, ProjectRow, SettingsMap } from './types';

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
  const [categories, projects, settings, desktop] = await Promise.all([
    db`select id, label, sort from categories`,
    db`select id, name, client, year, summary, challenge, solution, final_thoughts, url, thumbnail,
              images, tags, categories, featured_color, featured_order, sort, body
       from projects`,
    loadSettings(),
    db`select id, kind, ref, label, src, x, y, mx, my, z from desktop_items`,
  ]);
  const data = buildFinderData(categories as CategoryRow[], projects as ProjectRow[], settings);
  data.desktop = buildDesktop(desktop as DesktopRow[], data.projects, data.categories, data.resume.url);
  // demo = belum ada API key: terminal menjawab dari data saja (lihat lib/ai-demo.ts).
  data.ai = { name: aiSettingsFrom(settings.ai).name, demo: !process.env.ANTHROPIC_API_KEY };
  return data;
}

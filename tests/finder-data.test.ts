import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildFinderData } from '../lib/finder-data';
import type { CategoryRow, ProjectRow } from '../lib/types';
// @ts-expect-error modul JS biasa tanpa tipe
import { validateData } from '../public/finder/finder-model.js';

const json = JSON.parse(readFileSync(new URL('../public/finder/finder-data.json', import.meta.url), 'utf8'));

/** Baris database setara isi finder-data.json (seperti hasil db/seed.sql). */
function rowsFromJson() {
  const categories: CategoryRow[] = json.categories.map((c: any, i: number) => ({ ...c, sort: i }));
  const projects: ProjectRow[] = json.projects.map((p: any, i: number) => {
    const fi = json.featured.findIndex((f: any) => f.projectId === p.id);
    return {
      id: p.id, name: p.name, client: p.client, year: p.year, summary: p.summary,
      challenge: p.challenge, solution: p.solution, final_thoughts: p.finalThoughts,
      url: p.url, thumbnail: p.thumbnail, images: p.images, tags: p.tags, categories: p.categories,
      featured_color: fi >= 0 ? json.featured[fi].color : null,
      featured_order: fi >= 0 ? fi : null,
      sort: i,
    };
  });
  const settings = { about: json.about, contact: json.contact, resume: json.resume, favorites: json.favorites };
  return { categories, projects, settings };
}

describe('buildFinderData', () => {
  test('hasilnya sama dengan finder-data.json (ditambah body)', () => {
    const { categories, projects, settings } = rowsFromJson();
    const out = buildFinderData(categories, projects, settings);
    expect({ ...out, projects: out.projects.map(({ body, ...p }) => p) }).toEqual(json);
  });

  test('body: dari kolom body kalau ada, kalau tidak dibuat dari isi lama', () => {
    const { categories, projects, settings } = rowsFromJson();
    const doc = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Baru' }] }] };
    projects[0].body = doc;
    const out = buildFinderData(categories, projects, settings);
    expect(out.projects.find(p => p.id === projects[0].id)!.body).toEqual(doc);
    const other = out.projects.find(p => p.id === projects[1].id)!;
    expect(other.body!.content![0]).toMatchObject({ type: 'paragraph', content: [{ text: projects[1].summary }] });
  });

  test('hasilnya valid menurut model Finder', () => {
    const { categories, projects, settings } = rowsFromJson();
    expect(validateData(buildFinderData(categories, projects, settings))).toEqual([]);
  });

  test('kategori yang sudah dihapus dibuang dari proyek', () => {
    const { categories, projects, settings } = rowsFromJson();
    projects[0].categories = ['website', 'sudah-dihapus'];
    const out = buildFinderData(categories, projects, settings);
    expect(out.projects.find(p => p.id === projects[0].id)!.categories).toEqual(['website']);
  });

  test('urutan mengikuti sort, bukan urutan baris', () => {
    const { categories, projects, settings } = rowsFromJson();
    const out = buildFinderData([...categories].reverse(), [...projects].reverse(), settings);
    expect(out.categories.map(c => c.id)).toEqual(json.categories.map((c: any) => c.id));
    expect(out.projects.map(p => p.id)).toEqual(json.projects.map((p: any) => p.id));
  });

  test('featured urut featured_order, yang null di akhir', () => {
    const { categories, projects, settings } = rowsFromJson();
    const brnd = projects.find(p => p.id === 'brnd')!;
    brnd.featured_color = '#0a84ff';
    brnd.featured_order = null;
    projects.find(p => p.id === 'glaze')!.featured_order = -1;
    const out = buildFinderData(categories, projects, settings);
    expect(out.featured.map(f => f.projectId)).toEqual(['glaze', 'archline', 'nexmind', 'brnd']);
  });

  test('database kosong dan nilai null tetap aman', () => {
    const out = buildFinderData([], [{
      id: 'x', name: 'X', client: null as any, year: null, summary: null as any, challenge: '', solution: '',
      final_thoughts: '', url: '', thumbnail: '', images: null as any, tags: null as any, categories: null as any,
      featured_color: null, featured_order: null, sort: 0,
    }], {});
    expect(out.favorites.map(f => f.id)).toEqual(['about', 'resume', 'contact']);
    expect(out.about).toEqual({});
    expect(out.contact).toEqual({ email: '', links: [] });
    expect(out.resume).toEqual({ url: '' });
    expect(out.projects[0]).toMatchObject({ year: '', client: '', images: [], tags: [], categories: [] });
    expect(validateData(out)).toEqual([]);
  });
});

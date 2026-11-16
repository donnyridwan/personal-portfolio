// Baris database → JSON yang dibaca public/finder/finder.js. Fungsi murni (dites di tests/finder-data.test.ts).
import type { CategoryRow, Contact, Favorite, FinderData, ProjectRow, SettingsMap } from './types';

export const DEFAULT_FAVORITES: Favorite[] = [
  { id: 'about', label: 'About', icon: 'person' },
  { id: 'resume', label: 'Resume', icon: 'doc' },
  { id: 'contact', label: 'Kontak', icon: 'mail' },
];

const bySort = <T extends { sort: number; id: string }>(a: T, b: T) =>
  a.sort - b.sort || a.id.localeCompare(b.id);

const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);

export function buildFinderData(
  categoryRows: CategoryRow[],
  projectRows: ProjectRow[],
  settings: SettingsMap,
): FinderData {
  const categories = [...categoryRows].sort(bySort).map(c => ({ id: c.id, label: c.label }));
  const catIds = new Set(categories.map(c => c.id));
  const rows = [...projectRows].sort(bySort);

  const projects = rows.map(p => ({
    id: p.id,
    name: p.name ?? '',
    client: p.client ?? '',
    year: p.year ?? ('' as const),
    categories: (p.categories ?? []).filter(c => catIds.has(c)),
    tags: p.tags ?? [],
    summary: p.summary ?? '',
    challenge: p.challenge ?? '',
    solution: p.solution ?? '',
    finalThoughts: p.final_thoughts ?? '',
    thumbnail: p.thumbnail ?? '',
    images: p.images ?? [],
    url: p.url ?? '',
  }));

  const order = (p: ProjectRow) => p.featured_order ?? Number.POSITIVE_INFINITY;
  const featured = rows
    .filter(p => p.featured_color)
    .sort((a, b) => order(a) - order(b) || bySort(a, b))
    .map(p => ({ projectId: p.id, color: p.featured_color! }));

  const contact = isObj(settings.contact) ? settings.contact : {};
  const resume = isObj(settings.resume) ? settings.resume : {};

  return {
    favorites: Array.isArray(settings.favorites) && settings.favorites.length
      ? (settings.favorites as Favorite[])
      : DEFAULT_FAVORITES,
    categories,
    projects,
    featured,
    about: isObj(settings.about) ? settings.about : {},
    contact: {
      email: typeof contact.email === 'string' ? contact.email : '',
      links: Array.isArray(contact.links) ? (contact.links as Contact['links']) : [],
    },
    resume: { url: typeof resume.url === 'string' ? resume.url : '' },
  };
}

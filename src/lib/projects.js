import { slugify } from './slug';
import { normalizeCaseStudy } from './blocks';

export function getProjectSlug(project) {
  return project.slug || slugify(project.title) || project.id;
}

export function getPublishedProjects(projects) {
  return (projects || []).filter((p) => p.published !== false);
}

export function findPublishedProject(projects, slug) {
  return getPublishedProjects(projects).find((p) => getProjectSlug(p) === slug) || null;
}

// Previous/next neighbours in the published list, wrapping at the ends
export function getAdjacentProjects(projects, slug) {
  const list = getPublishedProjects(projects);
  const idx = list.findIndex((p) => getProjectSlug(p) === slug);
  if (list.length < 2 || idx === -1) return { prev: null, next: null };
  return {
    prev: list[(idx - 1 + list.length) % list.length],
    next: list[(idx + 1) % list.length],
  };
}

// Cover for the detail page and prev/next cards (shown at a fixed 4:3): the dedicated detail cover,
// or the grid cover when none was uploaded
export function getDetailCover(project) {
  const { cover } = normalizeCaseStudy(project.caseStudy);
  if (cover.url) return cover;
  const video = project.video || project.video_url || '';
  if (video && (project.mediaType === 'video' || !project.image)) return { url: video, mediaType: 'video' };
  return { url: project.image || '', mediaType: 'image' };
}

// Sort values for saving a reordered list: 1..n in display order
export function toSortOrder(projects) {
  return projects.map((p, idx) => ({ id: p.id, sort: idx + 1 }));
}

// New projects go to the end of the list
export function nextSort(projects) {
  const sorts = projects.map((p) => p.sort).filter((s) => Number.isFinite(s));
  return sorts.length ? Math.max(...sorts) + 1 : 1;
}

// Moves one item up (-1) or down (+1); returns the same list when the move is out of bounds
export function moveItem(list, index, delta) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

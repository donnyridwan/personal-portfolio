import { slugify } from './slug';

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

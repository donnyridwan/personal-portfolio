import { describe, it, expect } from 'vitest';
import { getPublishedProjects, findPublishedProject, getAdjacentProjects, getProjectSlug } from './projects';

const ps = [
  { id: '1', slug: 'a', published: true },
  { id: '2', slug: 'b', published: false },
  { id: '3', slug: 'c', published: true },
];

describe('getPublishedProjects', () => {
  it('drops unpublished projects and keeps ones without the flag', () => {
    expect(getPublishedProjects([...ps, { id: '4', slug: 'd' }]).map((p) => p.id)).toEqual(['1', '3', '4']);
  });
});

describe('findPublishedProject', () => {
  it('hides unpublished projects', () => {
    expect(findPublishedProject(ps, 'b')).toBeNull();
  });

  it('finds a published project by slug', () => {
    expect(findPublishedProject(ps, 'c').id).toBe('3');
  });

  it('returns null for an unknown slug', () => {
    expect(findPublishedProject(ps, 'zzz')).toBeNull();
  });
});

describe('getAdjacentProjects', () => {
  it('wraps around the published list', () => {
    expect(getAdjacentProjects(ps, 'a')).toEqual({ prev: ps[2], next: ps[2] });
  });

  it('returns nulls with a single published project', () => {
    expect(getAdjacentProjects([ps[0]], 'a')).toEqual({ prev: null, next: null });
  });

  it('picks neighbours in the middle of the list', () => {
    const list = [
      { id: '1', slug: 'a' },
      { id: '2', slug: 'b' },
      { id: '3', slug: 'c' },
    ];
    expect(getAdjacentProjects(list, 'b')).toEqual({ prev: list[0], next: list[2] });
  });
});

describe('getProjectSlug', () => {
  it('derives a slug from the title when none is stored', () => {
    expect(getProjectSlug({ id: 'p1', title: 'HARVASTA' })).toBe('harvasta');
  });

  it('falls back to the id when the title has no slug-safe characters', () => {
    expect(getProjectSlug({ id: 'p1', title: '🚀' })).toBe('p1');
  });
});

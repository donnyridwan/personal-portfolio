import { describe, it, expect } from 'vitest';
import { getPublishedProjects, findPublishedProject, getAdjacentProjects, getProjectSlug, getDetailCover, toSortOrder, nextSort, moveItem } from './projects';

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

describe('getDetailCover', () => {
  it('prefers the dedicated detail-page cover', () => {
    const project = { image: 'grid.png', caseStudy: { cover: { url: 'detail.mp4', mediaType: 'video' } } };
    expect(getDetailCover(project)).toEqual({ url: 'detail.mp4', mediaType: 'video' });
  });

  it('falls back to the grid image', () => {
    expect(getDetailCover({ image: 'grid.png', mediaType: 'image', caseStudy: { cover: { url: '', mediaType: 'image' } } })).toEqual({
      url: 'grid.png',
      mediaType: 'image',
    });
  });

  it('falls back to the grid video', () => {
    expect(getDetailCover({ image: '', video: 'grid.mp4', mediaType: 'video' })).toEqual({ url: 'grid.mp4', mediaType: 'video' });
  });

  it('returns an empty url when the project has no media at all', () => {
    expect(getDetailCover({ image: '', video: '' })).toEqual({ url: '', mediaType: 'image' });
  });
});

describe('toSortOrder', () => {
  it('numbers projects 1..n in their current order', () => {
    expect(toSortOrder([{ id: 'b', sort: 1 }, { id: 'a', sort: 1 }, { id: 'c', sort: 9 }])).toEqual([
      { id: 'b', sort: 1 },
      { id: 'a', sort: 2 },
      { id: 'c', sort: 3 },
    ]);
  });
});

describe('nextSort', () => {
  it('places a new project after the highest sort', () => {
    expect(nextSort([{ sort: 1 }, { sort: 4 }, { sort: 2 }])).toBe(5);
  });

  it('starts at 1 for an empty list or missing sorts', () => {
    expect(nextSort([])).toBe(1);
    expect(nextSort([{ id: 'x' }])).toBe(1);
  });
});

describe('moveItem', () => {
  const list = ['a', 'b', 'c'];

  it('moves an item up by one', () => {
    expect(moveItem(list, 1, -1)).toEqual(['b', 'a', 'c']);
  });

  it('moves an item down by one', () => {
    expect(moveItem(list, 1, 1)).toEqual(['a', 'c', 'b']);
  });

  it('returns the same list when the move would leave the bounds', () => {
    expect(moveItem(list, 0, -1)).toBe(list);
    expect(moveItem(list, 2, 1)).toBe(list);
  });
});

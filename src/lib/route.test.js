import { describe, it, expect } from 'vitest';
import { parseRoute, projectPath } from './route';

describe('parseRoute', () => {
  it('parses a project path', () => {
    expect(parseRoute('/work/harvasta', '', '')).toEqual({ view: 'project', slug: 'harvasta' });
  });

  it('ignores a trailing slash on project paths', () => {
    expect(parseRoute('/work/harvasta/', '', '')).toEqual({ view: 'project', slug: 'harvasta' });
  });

  it('routes /admin to the cms', () => {
    expect(parseRoute('/admin', '', '')).toEqual({ view: 'cms' });
  });

  it('reads the tab from the hash', () => {
    expect(parseRoute('/', '#about', '')).toEqual({ view: 'about' });
    expect(parseRoute('/', '#cms', '')).toEqual({ view: 'cms' });
  });

  it('reads the tab from ?tab=', () => {
    expect(parseRoute('/', '', '?tab=contact')).toEqual({ view: 'contact' });
  });

  it('defaults to work', () => {
    expect(parseRoute('/', '', '')).toEqual({ view: 'work' });
  });
});

describe('projectPath', () => {
  it('builds /work/<slug>', () => {
    expect(projectPath('harvasta')).toBe('/work/harvasta');
  });
});

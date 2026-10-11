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

describe('parseRoute edge cases', () => {
  it('opens project slugs that start with admin or cms', () => {
    expect(parseRoute('/work/admin-dashboard', '', '')).toEqual({ view: 'project', slug: 'admin-dashboard' });
    expect(parseRoute('/work/cms-redesign', '', '')).toEqual({ view: 'project', slug: 'cms-redesign' });
  });

  it('still routes /cms/ and nested admin paths to the cms', () => {
    expect(parseRoute('/cms/', '', '')).toEqual({ view: 'cms' });
    expect(parseRoute('/admin/projects', '', '')).toEqual({ view: 'cms' });
  });

  it('does not throw on a malformed percent-encoded slug', () => {
    expect(parseRoute('/work/%E0%A4%A', '', '')).toEqual({ view: 'project', slug: '%e0%a4%a' });
  });
});

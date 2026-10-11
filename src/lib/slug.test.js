import { describe, it, expect } from 'vitest';
import { slugify, uniqueSlug } from './slug';

describe('slugify', () => {
  it('lowercases a single word', () => {
    expect(slugify('HARVASTA')).toBe('harvasta');
  });

  it('turns punctuation and spaces into single dashes', () => {
    expect(slugify('EvalNow: Educational UX for a multi-stakeholder platform')).toBe(
      'evalnow-educational-ux-for-a-multi-stakeholder-platform'
    );
  });

  it('strips accents and trims surrounding dashes', () => {
    expect(slugify('  Café — Résumé  ')).toBe('cafe-resume');
  });

  it('returns empty string when nothing slug-safe remains', () => {
    expect(slugify('🚀')).toBe('');
  });
});

describe('uniqueSlug', () => {
  it('suffixes -2 on first collision', () => {
    expect(uniqueSlug('harvasta', ['harvasta'])).toBe('harvasta-2');
  });

  it('keeps counting until free', () => {
    expect(uniqueSlug('harvasta', ['harvasta', 'harvasta-2'])).toBe('harvasta-3');
  });

  it('falls back to "project" for an empty base', () => {
    expect(uniqueSlug('', [])).toBe('project');
    expect(uniqueSlug('', ['project'])).toBe('project-2');
  });
});

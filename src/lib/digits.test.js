import { describe, it, expect } from 'vitest';
import { splitDigits } from './digits';

describe('splitDigits', () => {
  it('staggers the last two characters by 1 and 2', () => {
    expect(splitDigits('48%')).toEqual([
      { char: '4', stagger: null },
      { char: '8', stagger: 1 },
      { char: '%', stagger: 2 },
    ]);
  });

  it('handles two-character values', () => {
    expect(splitDigits('3×')).toEqual([
      { char: '3', stagger: 1 },
      { char: '×', stagger: 2 },
    ]);
  });

  it('handles a single character', () => {
    expect(splitDigits('7')).toEqual([{ char: '7', stagger: 2 }]);
  });

  it('keeps multi-code-unit characters whole', () => {
    expect(splitDigits('1🚀').map((d) => d.char)).toEqual(['1', '🚀']);
  });

  it('returns an empty list for empty input', () => {
    expect(splitDigits('')).toEqual([]);
  });
});

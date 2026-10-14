import { describe, it, expect } from 'vitest';
import { distributeColumns } from './grid';

describe('distributeColumns', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];

  it('deals items left to right into 2 columns, keeping each original index', () => {
    expect(distributeColumns(items, 2)).toEqual([
      [{ item: 'a', index: 0 }, { item: 'c', index: 2 }, { item: 'e', index: 4 }],
      [{ item: 'b', index: 1 }, { item: 'd', index: 3 }],
    ]);
  });

  it('deals items into 3 columns', () => {
    expect(distributeColumns(items, 3).map((col) => col.map((c) => c.item))).toEqual([['a', 'd'], ['b', 'e'], ['c']]);
  });

  it('always returns the requested number of columns', () => {
    expect(distributeColumns(['a'], 3)).toEqual([[{ item: 'a', index: 0 }], [], []]);
  });
});

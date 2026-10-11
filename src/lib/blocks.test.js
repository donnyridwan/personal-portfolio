import { describe, it, expect } from 'vitest';
import { BLOCK_TYPES, createBlock, duplicateBlock, normalizeBlock, isRenderable, normalizeCaseStudy, patchBlock } from './blocks';

describe('BLOCK_TYPES', () => {
  it('lists the six block types in order', () => {
    expect(BLOCK_TYPES.map((b) => b.type)).toEqual(['text', 'image', 'gallery', 'video', 'metrics', 'quote']);
  });
});

describe('createBlock', () => {
  it('creates an empty gallery with 2 columns and a fresh id', () => {
    const block = createBlock('gallery');
    expect(block).toMatchObject({ type: 'gallery', columns: 2, images: [] });
    expect(block.id).toBeTruthy();
    expect(createBlock('gallery').id).not.toBe(block.id);
  });

  it('creates metrics with two empty rows', () => {
    expect(createBlock('metrics').items).toEqual([{ value: '', label: '' }, { value: '', label: '' }]);
  });
});

describe('normalizeBlock', () => {
  it('clamps an invalid gallery column count and coerces images to an array', () => {
    expect(normalizeBlock({ id: 'g', type: 'gallery', columns: 7, images: null })).toEqual({
      id: 'g',
      type: 'gallery',
      columns: 2,
      images: [],
    });
  });

  it('rejects unknown types and non-objects', () => {
    expect(normalizeBlock({ id: 'x', type: 'carousel' })).toBeNull();
    expect(normalizeBlock('text')).toBeNull();
    expect(normalizeBlock(null)).toBeNull();
  });

  it('caps metrics at four items and survives items: null', () => {
    const five = Array.from({ length: 5 }, (_, i) => ({ value: String(i), label: '' }));
    expect(normalizeBlock({ id: 'm', type: 'metrics', items: five }).items).toHaveLength(4);
    expect(normalizeBlock({ id: 'm', type: 'metrics', items: null }).items).toEqual([]);
  });
});

describe('isRenderable', () => {
  it('needs a heading or body for text', () => {
    expect(isRenderable({ type: 'text', label: 'x', heading: '', body: '' })).toBe(false);
    expect(isRenderable({ type: 'text', label: '', heading: 'Challenge', body: '' })).toBe(true);
  });

  it('needs a url for image and video', () => {
    expect(isRenderable({ type: 'image', url: '', caption: 'c' })).toBe(false);
    expect(isRenderable({ type: 'video', url: 'https://x/v.mp4', caption: '' })).toBe(true);
  });

  it('needs one gallery image with a url', () => {
    expect(isRenderable({ type: 'gallery', columns: 2, images: [{ url: '', caption: '' }] })).toBe(false);
    expect(isRenderable({ type: 'gallery', columns: 2, images: [{ url: 'https://x/a.jpg', caption: '' }] })).toBe(true);
  });

  it('needs one metric value', () => {
    expect(isRenderable({ type: 'metrics', items: [{ value: '32%', label: '' }] })).toBe(true);
    expect(isRenderable({ type: 'metrics', items: [{ value: '', label: 'Conversion' }] })).toBe(false);
  });

  it('needs quote text', () => {
    expect(isRenderable({ type: 'quote', text: 'Great', name: '', role: '' })).toBe(true);
  });

  it('is false for unknown types', () => {
    expect(isRenderable({ type: 'carousel' })).toBe(false);
  });
});

describe('normalizeCaseStudy', () => {
  it('returns empty defaults for null', () => {
    expect(normalizeCaseStudy(null)).toEqual({ client: '', summary: '', liveUrl: '', blocks: [] });
  });

  it('parses a JSON string', () => {
    const cs = normalizeCaseStudy('{"client":"Acme","blocks":[{"id":"a","type":"text","heading":"Hi"}]}');
    expect(cs.client).toBe('Acme');
    expect(cs.blocks).toHaveLength(1);
  });

  it('drops unknown blocks', () => {
    expect(normalizeCaseStudy({ blocks: [{ id: 'x', type: 'carousel' }] }).blocks).toEqual([]);
  });

  it('survives invalid JSON strings', () => {
    expect(normalizeCaseStudy('{not json').blocks).toEqual([]);
  });
});

describe('duplicateBlock', () => {
  it('copies fields under a new id', () => {
    const original = { id: 'q1', type: 'quote', text: 'Great', name: 'Ana', role: 'CEO' };
    const copy = duplicateBlock(original);
    expect(copy).toMatchObject({ type: 'quote', text: 'Great', name: 'Ana', role: 'CEO' });
    expect(copy.id).not.toBe('q1');
  });

  it('does not share nested arrays with the original', () => {
    const original = { id: 'g1', type: 'gallery', columns: 3, images: [{ url: 'https://x/a.jpg', caption: '' }] };
    const copy = duplicateBlock(original);
    copy.images[0].caption = 'changed';
    expect(original.images[0].caption).toBe('');
  });
});

describe('patchBlock', () => {
  const blocks = [
    { id: 'a', type: 'text', label: '', heading: 'A', body: '' },
    { id: 'g', type: 'gallery', columns: 2, images: [{ url: 'one', caption: '' }, { url: '', caption: '' }] },
  ];

  it('merges an object patch into the matching block only', () => {
    const next = patchBlock(blocks, 'a', { heading: 'Changed' });
    expect(next[0].heading).toBe('Changed');
    expect(next[1]).toBe(blocks[1]);
  });

  it('computes a function patch from the current block, so late uploads keep earlier edits', () => {
    // An upload that started before image 0 was set must not wipe it when it lands on image 1
    const latest = patchBlock(blocks, 'g', (cur) => ({
      images: cur.images.map((img, i) => (i === 1 ? { ...img, url: 'two' } : img)),
    }));
    expect(latest[1].images.map((i) => i.url)).toEqual(['one', 'two']);
  });

  it('returns the list unchanged when the block was deleted meanwhile', () => {
    expect(patchBlock(blocks, 'missing', { heading: 'x' })).toEqual(blocks);
  });
});

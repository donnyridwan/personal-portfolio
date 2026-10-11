import { describe, it, expect } from 'vitest';
import { BLOCK_TYPES, createBlock, normalizeBlock, isRenderable, normalizeCaseStudy } from './blocks';

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

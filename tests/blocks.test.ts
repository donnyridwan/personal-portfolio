import { describe, expect, test } from 'vitest';
import { docText, emptyDoc, legacyToDoc, MAX_DOC_CHARS, validateDoc } from '../lib/blocks';

const legacy = {
  summary: 'Ringkasan proyek.',
  images: ['https://img/a.jpg', 'https://img/b.jpg'],
  challenge: 'Tantangannya.',
  solution: 'Solusinya.',
  final_thoughts: '',
};

describe('legacyToDoc', () => {
  test('isi lama jadi blok: ringkasan, preview, lalu bagian berjudul', () => {
    const d = legacyToDoc(legacy);
    expect(d.type).toBe('doc');
    expect(d.content!.map(n => n.type)).toEqual([
      'paragraph', 'heading', 'image', 'image', 'heading', 'paragraph', 'heading', 'paragraph',
    ]);
    expect(d.content![1]).toMatchObject({ type: 'heading', attrs: { level: 3 }, content: [{ text: 'Preview' }] });
    expect(d.content![2]).toMatchObject({ attrs: { src: 'https://img/a.jpg' } });
    expect(docText(d)).toContain('Solusinya.');
    expect(docText(d)).not.toContain('Final thoughts'); // bagian kosong dilewati
  });

  test('proyek tanpa isi → kanvas kosong', () => {
    expect(legacyToDoc({ summary: '', images: [], challenge: '', solution: '', final_thoughts: '' })).toEqual(emptyDoc());
  });
});

describe('validateDoc', () => {
  test('dokumen valid diterima apa adanya', () => {
    const d = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Judul' }] },
        { type: 'paragraph', content: [
          { type: 'text', text: 'tebal', marks: [{ type: 'bold' }] },
          { type: 'text', text: ' link', marks: [{ type: 'link', attrs: { href: 'https://x.com', target: '_blank' } }] },
        ] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }] }] },
        { type: 'image', attrs: { src: 'https://res.cloudinary.com/x.png', alt: 'foto' } },
        { type: 'horizontalRule' },
      ],
    };
    expect(validateDoc(d)).toEqual(d);
  });

  test('node, mark, dan link berbahaya dibuang', () => {
    const d = validateDoc({
      type: 'doc',
      content: [
        { type: 'script', content: [{ type: 'text', text: 'x' }] },
        { type: 'paragraph', content: [
          { type: 'text', text: 'klik', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }, { type: 'evil' }] },
        ] },
        { type: 'image', attrs: { src: 'javascript:alert(1)' } },
        { type: 'heading', attrs: { level: 9 }, content: [{ type: 'text', text: 'h' }] },
      ],
    });
    expect(d).toEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'klik' }] },
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'h' }] },
      ],
    });
  });

  test('video: hanya src https yang diterima, atribut lain dibuang', () => {
    const d = validateDoc({
      type: 'doc',
      content: [
        { type: 'video', attrs: { src: 'https://res.cloudinary.com/v/upload/a.mp4', onerror: 'x' } },
        { type: 'video', attrs: { src: 'javascript:alert(1)' } },
        { type: 'video', attrs: { src: 'http://tidak-aman/a.mp4' } },
      ],
    });
    expect(d).toEqual({ type: 'doc', content: [{ type: 'video', attrs: { src: 'https://res.cloudinary.com/v/upload/a.mp4' } }] });
  });

  test('menolak yang bukan dokumen atau terlalu besar', () => {
    expect(validateDoc(null)).toBeNull();
    expect(validateDoc({ type: 'paragraph' })).toBeNull();
    expect(validateDoc('teks')).toBeNull();
    const big = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x'.repeat(MAX_DOC_CHARS) }] }] };
    expect(validateDoc(big)).toBeNull();
  });
});

test('docText menggabungkan teks per blok', () => {
  const d = { type: 'doc', content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Judul' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Satu ' }, { type: 'text', text: 'dua' }] },
  ] };
  expect(docText(d)).toBe('Judul\nSatu dua');
});

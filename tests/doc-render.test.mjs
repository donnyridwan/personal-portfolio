import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderDoc, isEmptyDoc } from '../public/finder/doc-render.js';

const img = (src, alt) => `<img src="${src}" alt="${alt}">`;

test('blok dan format teks jadi HTML', () => {
  const html = renderDoc({ type: 'doc', content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Judul' }] },
    { type: 'paragraph', content: [
      { type: 'text', text: 'tebal', marks: [{ type: 'bold' }] },
      { type: 'text', text: ' & ' },
      { type: 'text', text: 'link', marks: [{ type: 'link', attrs: { href: 'https://x.com' } }] },
    ] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }] }] },
    { type: 'image', attrs: { src: 'https://i/a.jpg', alt: 'A' } },
    { type: 'horizontalRule' },
  ] }, img);
  assert.equal(html,
    '<h2>Judul</h2><p><strong>tebal</strong> &amp; <a href="https://x.com" target="_blank" rel="noopener">link</a></p>'
    + '<ul><li><p>a</p></li></ul><figure><img src="https://i/a.jpg" alt="A"></figure><hr>');
});

test('teks di-escape dan link javascript diabaikan', () => {
  const html = renderDoc({ type: 'doc', content: [{ type: 'paragraph', content: [
    { type: 'text', text: '<script>x</script>', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] },
  ] }] }, img);
  assert.equal(html, '<p>&lt;script&gt;x&lt;/script&gt;</p>');
});

test('node tak dikenal diabaikan, dokumen kosong terdeteksi', () => {
  assert.equal(renderDoc({ type: 'doc', content: [{ type: 'iframe' }] }, img), '');
  assert.equal(isEmptyDoc({ type: 'doc', content: [{ type: 'paragraph' }] }), true);
  assert.equal(isEmptyDoc({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x' }] }] }), false);
});

test('video dirender dengan kontrol; src tidak aman diabaikan', () => {
  const html = renderDoc({ type: 'doc', content: [
    { type: 'video', attrs: { src: 'https://v/a.mp4?x="1"' } },
    { type: 'video', attrs: { src: 'javascript:alert(1)' } },
  ] }, img);
  assert.equal(html, '<figure><video src="https://v/a.mp4?x=&quot;1&quot;" controls playsinline preload="metadata"></video></figure>');
});

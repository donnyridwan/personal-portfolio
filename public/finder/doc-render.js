// Dokumen blok (JSON Tiptap) → HTML untuk dibaca pengunjung. Murni, tanpa DOM (dites dengan node --test).

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SAFE_URL = /^(https?:\/\/|mailto:)/i;

function marked(text, marks = []) {
  let html = esc(text);
  for (const m of marks) {
    if (m.type === 'bold') html = `<strong>${html}</strong>`;
    else if (m.type === 'italic') html = `<em>${html}</em>`;
    else if (m.type === 'underline') html = `<u>${html}</u>`;
    else if (m.type === 'strike') html = `<s>${html}</s>`;
    else if (m.type === 'code') html = `<code>${html}</code>`;
    else if (m.type === 'link' && SAFE_URL.test(m.attrs?.href ?? '')) {
      html = `<a href="${esc(m.attrs.href)}" target="_blank" rel="noopener">${html}</a>`;
    }
  }
  return html;
}

/**
 * @param {object} doc dokumen {type:'doc', content:[...]}
 * @param {(src: string, alt: string) => string} image pembuat HTML gambar (pakai helper img() Finder)
 */
export function renderDoc(doc, image) {
  const kids = n => (n.content ?? []).map(node).join('');
  function node(n) {
    switch (n?.type) {
      case 'text': return marked(n.text, n.marks);
      case 'hardBreak': return '<br>';
      case 'paragraph': return `<p>${kids(n) || '<br>'}</p>`;
      case 'heading': {
        const l = Math.min(3, Math.max(1, Number(n.attrs?.level) || 2));
        return `<h${l + 1}>${kids(n)}</h${l + 1}>`; // h2–h4: di bawah judul proyek (h2 di kop → h1 dokumen jadi h2)
      }
      case 'bulletList': return `<ul>${kids(n)}</ul>`;
      case 'orderedList': return `<ol>${kids(n)}</ol>`;
      case 'listItem': return `<li>${kids(n)}</li>`;
      case 'blockquote': return `<blockquote>${kids(n)}</blockquote>`;
      case 'horizontalRule': return '<hr>';
      case 'codeBlock': return `<pre><code>${esc((n.content ?? []).map(c => c.text ?? '').join(''))}</code></pre>`;
      case 'image': return n.attrs?.src ? `<figure>${image(n.attrs.src, n.attrs.alt ?? '')}</figure>` : '';
      default: return '';
    }
  }
  return kids(doc ?? {});
}

/** Dokumen kosong (hanya paragraf kosong)? */
export function isEmptyDoc(doc) {
  const c = doc?.content ?? [];
  return c.length === 0 || c.every(n => n.type === 'paragraph' && !(n.content ?? []).length);
}

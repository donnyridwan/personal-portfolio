// Isi detail proyek sebagai dokumen blok (format JSON Tiptap/ProseMirror). Fungsi murni (dites).

export type Mark = { type: string; attrs?: Record<string, unknown> };
export type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  text?: string;
  marks?: Mark[];
};

/** Batas ukuran dokumen (karakter JSON) supaya satu proyek tidak membengkak. */
export const MAX_DOC_CHARS = 200_000;
const MAX_DEPTH = 24;

export const emptyDoc = (): DocNode => ({ type: 'doc', content: [{ type: 'paragraph' }] });

const text = (t: string): DocNode => ({ type: 'text', text: t });
const para = (t: string): DocNode => ({ type: 'paragraph', content: [text(t)] });
const heading = (t: string, level = 3): DocNode => ({ type: 'heading', attrs: { level }, content: [text(t)] });

type Legacy = { summary: string; images: string[]; challenge: string; solution: string; final_thoughts: string };

/** Isi lama (kolom tetap) → blok awal di kanvas. */
export function legacyToDoc(p: Legacy): DocNode {
  const blocks: DocNode[] = [];
  if (p.summary?.trim()) blocks.push(para(p.summary.trim()));
  const imgs = (p.images ?? []).filter(Boolean);
  if (imgs.length) {
    blocks.push(heading('Preview'));
    for (const src of imgs) blocks.push({ type: 'image', attrs: { src, alt: '' } });
  }
  for (const [title, body] of [['Challenges', p.challenge], ['Solution', p.solution], ['Final thoughts', p.final_thoughts]]) {
    if (body?.trim()) blocks.push(heading(title), para(body.trim()));
  }
  return blocks.length ? { type: 'doc', content: blocks } : emptyDoc();
}

/* ---------- Validasi isi dari editor ---------- */

const BLOCKS = new Set(['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'horizontalRule', 'image', 'codeBlock', 'hardBreak', 'text']);
const MARKS = new Set(['bold', 'italic', 'underline', 'strike', 'code', 'link']);
const SAFE_URL = /^(https?:\/\/|mailto:)/i;
const SAFE_SRC = /^(https:\/\/|assets\/)/i;

function cleanMarks(marks: unknown): Mark[] | undefined {
  if (!Array.isArray(marks)) return undefined;
  const out: Mark[] = [];
  for (const m of marks) {
    if (!m || typeof m !== 'object' || !MARKS.has((m as Mark).type)) continue;
    if ((m as Mark).type === 'link') {
      const href = String((m as Mark).attrs?.href ?? '');
      if (!SAFE_URL.test(href)) continue;
      out.push({ type: 'link', attrs: { ...(m as Mark).attrs, href } });
    } else {
      out.push({ type: (m as Mark).type });
    }
  }
  return out.length ? out : undefined;
}

function cleanNode(n: unknown, depth: number): DocNode | null {
  if (!n || typeof n !== 'object' || depth > MAX_DEPTH) return null;
  const node = n as DocNode;
  if (!BLOCKS.has(node.type)) return null;

  if (node.type === 'text') {
    if (typeof node.text !== 'string' || !node.text) return null;
    const marks = cleanMarks(node.marks);
    return marks ? { type: 'text', text: node.text, marks } : { type: 'text', text: node.text };
  }
  if (node.type === 'image') {
    const src = String(node.attrs?.src ?? '');
    if (!SAFE_SRC.test(src)) return null;
    return { type: 'image', attrs: { ...node.attrs, src, alt: String(node.attrs?.alt ?? '') } };
  }

  const out: DocNode = { type: node.type };
  if (node.type === 'heading') {
    const level = Number(node.attrs?.level);
    out.attrs = { level: Math.min(3, Math.max(1, Number.isFinite(level) ? Math.round(level) : 2)) };
  } else if (node.attrs && typeof node.attrs === 'object') {
    out.attrs = node.attrs;
  }
  if (Array.isArray(node.content)) {
    const kids = node.content.map(c => cleanNode(c, depth + 1)).filter((c): c is DocNode => !!c);
    if (kids.length) out.content = kids;
  }
  return out;
}

/** Bersihkan dokumen dari browser: hanya node & mark yang dikenal, link/gambar aman. null kalau tidak valid. */
export function validateDoc(input: unknown): DocNode | null {
  if (!input || typeof input !== 'object' || (input as DocNode).type !== 'doc') return null;
  if (JSON.stringify(input).length > MAX_DOC_CHARS) return null;
  const content = Array.isArray((input as DocNode).content)
    ? (input as DocNode).content!.map(c => cleanNode(c, 1)).filter((c): c is DocNode => !!c)
    : [];
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}

/* ---------- Teks polos (untuk AI) ---------- */

const inline = (n: DocNode): string =>
  n.type === 'text' ? n.text ?? '' : n.type === 'hardBreak' ? '\n' : (n.content ?? []).map(inline).join('');

/** Teks polos per blok, dipisah baris baru. */
export function docText(doc: DocNode | null | undefined): string {
  const lines: string[] = [];
  const walk = (n: DocNode) => {
    if (['paragraph', 'heading', 'codeBlock'].includes(n.type)) {
      const t = inline(n).trim();
      if (t) lines.push(t);
    } else if (n.type === 'listItem') {
      const t = (n.content ?? []).map(inline).join(' ').trim();
      if (t) lines.push(`- ${t}`);
    } else {
      (n.content ?? []).forEach(walk);
    }
  };
  if (doc) walk(doc);
  return lines.join('\n');
}

/** Gambar pertama di dokumen (dipakai sebagai cadangan thumbnail). */
export function docImages(doc: DocNode | null | undefined): string[] {
  const out: string[] = [];
  const walk = (n: DocNode) => {
    if (n.type === 'image' && typeof n.attrs?.src === 'string') out.push(n.attrs.src);
    (n.content ?? []).forEach(walk);
  };
  if (doc) walk(doc);
  return out;
}

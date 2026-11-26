// Editor kanvas ala Notion untuk isi detail proyek (hanya dimuat di mode edit admin).
// Dibundel dengan esbuild ke public/editor/editor.js (`npm run build:editor`).
import { Editor, Extension, Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Placeholder, TrailingNode } from '@tiptap/extensions';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import Suggestion, { exitSuggestion } from '@tiptap/suggestion';

const ICON = {
  text: 'T', h1: 'H1', h2: 'H2', h3: 'H3', bullet: '•', ordered: '1.', quote: '❝', code: '</>', divider: '—', image: '🖼', video: '▶',
};

/** Pilihan blok di menu "/". run(editor, range) mengganti teks "/…" dengan bloknya. */
function slashItems(opts) {
  const chain = (editor, range) => editor.chain().focus().deleteRange(range);
  return [
    { id: 'text', title: 'Teks', hint: 'Paragraf biasa', keys: 'teks text paragraf p', run: (e, r) => chain(e, r).setParagraph().run() },
    { id: 'h1', title: 'Judul 1', hint: 'Judul besar', keys: 'judul heading h1 besar', run: (e, r) => chain(e, r).setHeading({ level: 1 }).run() },
    { id: 'h2', title: 'Judul 2', hint: 'Judul sedang', keys: 'judul heading h2 sedang', run: (e, r) => chain(e, r).setHeading({ level: 2 }).run() },
    { id: 'h3', title: 'Judul 3', hint: 'Judul kecil', keys: 'judul heading h3 kecil', run: (e, r) => chain(e, r).setHeading({ level: 3 }).run() },
    { id: 'bullet', title: 'Daftar poin', hint: 'Daftar dengan titik', keys: 'daftar list bullet poin ul', run: (e, r) => chain(e, r).toggleBulletList().run() },
    { id: 'ordered', title: 'Daftar nomor', hint: 'Daftar bernomor', keys: 'daftar list nomor angka ol numbered', run: (e, r) => chain(e, r).toggleOrderedList().run() },
    { id: 'quote', title: 'Kutipan', hint: 'Kutipan / catatan', keys: 'kutipan quote blockquote', run: (e, r) => chain(e, r).toggleBlockquote().run() },
    { id: 'code', title: 'Kode', hint: 'Blok kode', keys: 'kode code', run: (e, r) => chain(e, r).toggleCodeBlock().run() },
    { id: 'divider', title: 'Pemisah', hint: 'Garis pemisah', keys: 'pemisah divider garis hr', run: (e, r) => chain(e, r).setHorizontalRule().run() },
    {
      id: 'image', title: 'Gambar', hint: 'Upload dari komputer', keys: 'gambar image foto upload',
      run: async (e, r) => {
        chain(e, r).run();
        // Catat posisi sekarang: selama jendela pilih file terbuka, seleksi editor bisa berubah.
        const pos = e.state.selection.from;
        const files = await opts.pickImages();
        await insertImages(e, files, opts, pos);
      },
    },
    {
      id: 'video', title: 'Video', hint: 'Upload MP4 / WebM / MOV', keys: 'video film klip mp4 movie upload',
      run: async (e, r) => {
        chain(e, r).run();
        const pos = e.state.selection.from;
        const files = await opts.pickVideos();
        await insertMedia(e, files, opts, pos);
      },
    },
  ];
}

/** Blok video (file dari Cloudinary), diputar dengan kontrol bawaan browser. */
const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'video[src]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: 'true', playsinline: 'true', preload: 'metadata' })];
  },
});

const isVideo = f => f.type.startsWith('video/');
const isImage = f => f.type.startsWith('image/');

/** Gambar & video sekaligus (dari seret/tempel), urutan dipertahankan. */
async function insertMedia(editor, files, opts, pos) {
  const nodes = [];
  for (const f of files) {
    if (isVideo(f)) {
      const src = await opts.uploadVideo(f).catch(err => { opts.onError?.(err.message); return null; });
      if (src) nodes.push({ type: 'video', attrs: { src } });
    } else if (isImage(f)) {
      const src = await opts.uploadImage(f).catch(err => { opts.onError?.(err.message); return null; });
      if (src) nodes.push({ type: 'image', attrs: { src, alt: '' } });
    }
  }
  if (!nodes.length) return;
  const at = typeof pos === 'number' ? Math.min(pos, editor.state.doc.content.size) : editor.state.selection.to;
  editor.chain().focus().insertContentAt(at, nodes).run();
}

async function insertImages(editor, files, opts, pos) {
  const nodes = [];
  for (const f of files) {
    const src = await opts.uploadImage(f).catch(err => { opts.onError?.(err.message); return null; });
    if (src) nodes.push({ type: 'image', attrs: { src, alt: '' } });
  }
  if (!nodes.length) return;
  const at = typeof pos === 'number' ? Math.min(pos, editor.state.doc.content.size) : editor.state.selection.to;
  editor.chain().focus().insertContentAt(at, nodes).run();
}

/* ---------- Menu "/" ---------- */

function slashMenu() {
  let el = null;
  let items = [];
  let index = 0;
  let command = null;

  const draw = () => {
    if (!el) return;
    el.innerHTML = items.length
      ? `<div class="ed-slash-head">Blok</div>` + items.map((it, i) => `
        <button type="button" class="ed-slash-item${i === index ? ' ed-active' : ''}" data-i="${i}">
          <span class="ed-slash-icon">${ICON[it.id]}</span>
          <span><b>${it.title}</b><small>${it.hint}</small></span>
        </button>`).join('')
      : '<div class="ed-slash-empty">Tidak ada blok yang cocok</div>';
    el.querySelector('.ed-active')?.scrollIntoView({ block: 'nearest' });
  };
  const place = rect => {
    if (!el || !rect) return;
    const h = el.offsetHeight || 300;
    const below = rect.bottom + 6 + h < innerHeight;
    el.style.left = `${Math.min(rect.left, innerWidth - el.offsetWidth - 8)}px`;
    el.style.top = `${below ? rect.bottom + 6 : Math.max(8, rect.top - h - 6)}px`;
  };

  return {
    onStart(props) {
      el = document.createElement('div');
      el.className = 'ed-slash';
      // Jangan sampai klik di menu diteruskan ke Finder/Framer atau mencuri fokus editor.
      el.addEventListener('mousedown', e => e.preventDefault());
      for (const t of ['pointerdown', 'pointerup', 'click']) el.addEventListener(t, e => e.stopPropagation());
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-i]');
        if (b) command?.(items[Number(b.dataset.i)]);
      });
      document.body.appendChild(el);
      items = props.items; index = 0; command = props.command;
      draw();
      place(props.clientRect?.());
    },
    onUpdate(props) {
      items = props.items; index = 0; command = props.command;
      draw();
      place(props.clientRect?.());
    },
    onKeyDown({ event, view }) {
      if (event.key === 'Escape') { exitSuggestion(view); return true; } // tutup menu, teks "/" tetap
      if (!items.length) return false;
      if (event.key === 'ArrowDown') { index = (index + 1) % items.length; draw(); return true; }
      if (event.key === 'ArrowUp') { index = (index - 1 + items.length) % items.length; draw(); return true; }
      if (event.key === 'Enter' || event.key === 'Tab') { command?.(items[index]); return true; }
      return false;
    },
    onExit() { el?.remove(); el = null; },
  };
}

function matchItems(all, q) {
  return q ? all.filter(it => it.title.toLowerCase().includes(q) || it.keys.includes(q)) : all;
}

function SlashCommand(opts) {
  const all = slashItems(opts);
  return Extension.create({
    name: 'slashCommand',
    addProseMirrorPlugins() {
      return [Suggestion({
        editor: this.editor,
        char: '/',
        allowSpaces: true, // supaya bisa mencari "judul 2"
        // Menu ditutup kalau tidak ada lagi yang cocok setelah spasi (berarti sedang mengetik biasa).
        allow: ({ state, range }) => {
          const q = state.doc.textBetween(range.from, range.to).slice(1).toLowerCase();
          return !/\s$/.test(q) || matchItems(all, q.trim()).length > 0;
        },
        items: ({ query }) => matchItems(all, query.toLowerCase().trim()),
        command: ({ editor, range, props }) => props.run(editor, range),
        render: slashMenu,
      })];
    },
  });
}

/* ---------- Toolbar format (muncul saat teks diblok) ---------- */

function bubbleElement() {
  const el = document.createElement('div');
  el.className = 'ed-bubble';
  el.innerHTML = [
    ['bold', '<b>B</b>', 'Tebal (⌘B)'],
    ['italic', '<i>I</i>', 'Miring (⌘I)'],
    ['underline', '<u>U</u>', 'Garis bawah (⌘U)'],
    ['strike', '<s>S</s>', 'Coret'],
    ['code', '&lt;/&gt;', 'Kode'],
    ['link', '🔗', 'Link'],
  ].map(([id, label, title]) => `<button type="button" data-mark="${id}" title="${title}" aria-label="${title}">${label}</button>`).join('');
  el.addEventListener('mousedown', e => e.preventDefault());
  for (const t of ['pointerdown', 'pointerup', 'click']) el.addEventListener(t, e => e.stopPropagation());
  return el;
}

/**
 * Pasang editor di elemen.
 * @param {HTMLElement} el
 * @param {{ content: object, onUpdate: (json: object) => void, uploadImage: (f: File) => Promise<string>,
 *           uploadVideo: (f: File) => Promise<string>, pickImages: () => Promise<File[]>,
 *           pickVideos: () => Promise<File[]>, onError?: (msg: string) => void }} opts
 */
export function mountEditor(el, opts) {
  const bubble = bubbleElement();
  const editor = new Editor({
    element: el,
    content: opts.content,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https', HTMLAttributes: { target: '_blank', rel: 'noopener' } },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Video,
      TrailingNode, // selalu ada paragraf kosong di akhir, jadi bisa lanjut mengetik setelah gambar/video
      Placeholder.configure({
        placeholder: ({ node }) => (node.type.name === 'heading' ? 'Judul' : 'Ketik "/" untuk memilih blok…'),
        showOnlyCurrent: true,
      }),
      BubbleMenu.configure({
        element: bubble,
        appendTo: () => document.body,
        shouldShow: ({ editor: ed, from, to }) => from !== to && !ed.isActive('image') && !ed.isActive('video') && !ed.isActive('codeBlock'),
      }),
      SlashCommand(opts),
    ],
    editorProps: {
      attributes: { class: 'ed-content df-doc', spellcheck: 'true' },
      // Gambar dari komputer: seret atau tempel langsung ke kanvas.
      handleDrop(view, event) {
        const files = [...(event.dataTransfer?.files ?? [])].filter(f => isImage(f) || isVideo(f));
        if (!files.length) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        insertMedia(editor, files, opts, pos);
        return true;
      },
      handlePaste(_view, event) {
        const files = [...(event.clipboardData?.files ?? [])].filter(f => isImage(f) || isVideo(f));
        if (!files.length) return false;
        insertMedia(editor, files, opts);
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => opts.onUpdate(ed.getJSON()),
  });

  bubble.addEventListener('click', e => {
    const b = e.target.closest('[data-mark]');
    if (!b) return;
    const mark = b.dataset.mark;
    const chain = editor.chain().focus();
    if (mark === 'link') {
      const prev = editor.getAttributes('link').href ?? '';
      const url = prompt('Alamat link (kosongkan untuk menghapus):', prev);
      if (url === null) return;
      if (!url.trim()) chain.extendMarkRange('link').unsetLink().run();
      else chain.extendMarkRange('link').setLink({ href: /^(https?:|mailto:)/i.test(url) ? url.trim() : `https://${url.trim()}` }).run();
      return;
    }
    const toggles = { bold: 'toggleBold', italic: 'toggleItalic', underline: 'toggleUnderline', strike: 'toggleStrike', code: 'toggleCode' };
    chain[toggles[mark]]().run();
  });
  const syncBubble = () => {
    for (const b of bubble.querySelectorAll('[data-mark]')) b.classList.toggle('ed-on', editor.isActive(b.dataset.mark));
  };
  editor.on('selectionUpdate', syncBubble);
  editor.on('transaction', syncBubble);

  return {
    editor,
    getJSON: () => editor.getJSON(),
    focus: () => editor.commands.focus('end'),
    destroy() { editor.destroy(); bubble.remove(); document.querySelectorAll('.ed-slash').forEach(n => n.remove()); },
  };
}

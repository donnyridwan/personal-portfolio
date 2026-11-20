// Viewer PDF sederhana untuk Resume: halaman-halaman disusun ke bawah, zoom 75%,
// tanpa toolbar / thumbnail bawaan browser. Digambar dengan pdf.js (public/pdfjs, dari npm run build:pdf).
const PDFJS = new URL('../pdfjs/pdf.min.mjs', import.meta.url).href;
const WORKER = new URL('../pdfjs/pdf.worker.min.mjs', import.meta.url).href;
const ZOOM = 0.75;
const PT_TO_PX = 96 / 72; // 100% = ukuran cetak asli di layar

let lib = null;
async function pdfjs() {
  if (!lib) {
    lib = import(PDFJS).then(m => { m.GlobalWorkerOptions.workerSrc = WORKER; return m; });
    lib.catch(() => { lib = null; });
  }
  return lib;
}

/** Pasang viewer di elemen `.df-pdf` (data-src = URL PDF). */
export async function mountPdf(el) {
  if (!el) return;
  const src = el.dataset.src;
  const pages = el.querySelector('.df-pdf-pages');
  let doc;
  try {
    const m = await pdfjs();
    doc = await m.getDocument({ url: src }).promise;
  } catch (err) {
    console.error('[resume] pdf', err);
    if (el.isConnected) pages.innerHTML = '<div class="df-empty">Resume belum bisa ditampilkan. Coba buka di tab baru.</div>';
    return;
  }
  if (!el.isConnected) { doc.destroy(); return; }

  let width = 0;
  let run = 0;
  const draw = async () => {
    const avail = el.clientWidth - 32;
    const id = ++run;
    const first = await doc.getPage(1);
    const natural = first.getViewport({ scale: ZOOM * PT_TO_PX }).width;
    const w = Math.min(natural, avail);
    if (Math.abs(w - width) < 1) return;
    width = w;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    for (let i = 1; i <= doc.numPages; i++) {
      const page = i === 1 ? first : await doc.getPage(i);
      if (id !== run || !el.isConnected) return;
      const base = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: (w / base.width) * dpr });
      const canvas = document.createElement('canvas');
      canvas.className = 'df-pdf-page';
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.style.width = `${w}px`;
      canvas.style.aspectRatio = `${vp.width} / ${vp.height}`;
      canvas.setAttribute('aria-label', `Halaman ${i} dari ${doc.numPages}`);
      await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      if (id !== run || !el.isConnected) return;
      if (i === 1) pages.replaceChildren(canvas); else pages.appendChild(canvas);
    }
  };

  await draw().catch(err => console.error('[resume] render', err));
  let t = 0;
  const ro = new ResizeObserver(() => {
    if (!el.isConnected) { ro.disconnect(); doc.destroy(); return; }
    clearTimeout(t);
    t = setTimeout(() => draw().catch(() => {}), 150);
  });
  ro.observe(el);
}

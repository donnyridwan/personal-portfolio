# Kanvas detail proyek (editor ala Notion): desain

Tanggal: 2026-11-16 · Disetujui pemilik ("oke gas")

## Maksud
Detail proyek diedit seperti dokumen Notion/Word: kop tetap template, isi di bawahnya kanvas kosong yang bebas diisi. Ketik "/" untuk memilih blok. Hanya admin yang bisa mengedit; pengunjung hanya membaca.

## Keputusan
- Edit langsung di jendela Finder pada mode edit (`/?edit`), bukan di form terpisah. Kop (thumbnail, nama, klien, tahun, tag, Visit) diubah lewat tombol "Edit kop…" (form Edit Detail).
- Editor: Tiptap v3, dibundel esbuild ke `public/editor/editor.js` (dimuat hanya di mode edit). Blok di menu "/": Teks, Judul 1–3, Daftar poin, Daftar nomor, Kutipan, Kode, Pemisah, Gambar. Toolbar saat teks diblok: tebal, miring, garis bawah, coret, kode, link. Gambar juga bisa diseret/ditempel; diunggah ke Cloudinary `dockfolio/projects/<id>`.
- Penyimpanan: kolom `projects.body` (JSON Tiptap), disimpan otomatis ±0,9 detik setelah berhenti mengetik, divalidasi di server (`lib/blocks.ts` → `validateDoc`: hanya node/mark yang dikenal, link http(s)/mailto, gambar https).
- Isi lama dipindah jadi blok awal (`legacyToDoc`; dijalankan sekali lewat `scripts/backfill-body.ts`). Kolom lama tetap ada sebagai cadangan, tidak lagi diedit.
- Tampilan publik: `public/finder/doc-render.js` mengubah dokumen jadi HTML aman dengan gaya Finder. AI Terminal (asli & demo) membaca teks dari kanvas.

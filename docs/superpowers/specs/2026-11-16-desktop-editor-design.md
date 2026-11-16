# Desktop editor (admin = kembaran situs publik): desain

Tanggal: 2026-11-16 · Ukuran: proyek

## Maksud
Pemilik ingin admin terasa seperti memakai komputer: situs yang sama persis dengan yang dilihat pengunjung, tapi di mode admin semuanya bisa diubah langsung — geser ikon/foto di desktop (posisi tersimpan), tambah portofolio seperti menambah file atau folder. Pengunjung tetap read-only.

Diputuskan pemilik: **pilihan A** — isi portofolio (proyek, foto, file, folder) digambar ulang oleh kita dan bisa ditambah/dihapus/digeser; app bawaan Framer (Showreel, Music, Terminal, Resources, Space Shooter, Cookies) tetap buatan Framer, hanya posisinya yang bisa digeser dan disimpan. Pemilik minta langsung dibangun tanpa sesi tanya-jawab lanjutan (AFK), jadi semua keputusan di bawah adalah keputusan Claude, bisa dikoreksi.

## Keputusan (semua *keputusan Claude*)
- **Masuk mode edit:** `/admin` (wajib login) mengalihkan ke `/?edit`. Halaman yang sama dengan situs publik; `desktop.js` memuat `edit.js` hanya kalau `?edit` ada **dan** `GET /api/admin/session` = 200. Semua tulis tetap dicek di server. Form lama pindah ke `/admin/projects`, `/admin/categories`, `/admin/profile` (masih dipakai sebagai "Edit detail…" di dalam jendela).
- **Data desktop:** tabel baru `desktop_items(id, kind, ref, label, src, x, y, mx, my, z)`.
  - `kind`: `project` (ref = id proyek), `folder` (ref = id kategori), `photo` (src = URL gambar), `file` (src = URL PDF; ref `resume` = resume dari profil), `app` (ref = class container Framer).
  - Posisi = titik tengah ikon sebagai pecahan lebar/tinggi layar (0–1). `x,y` untuk layar ≥ 810 px (breakpoint Framer), `mx,my` untuk HP. Kosong = ditaruh otomatis di grid kosong dari kanan atas (seperti macOS).
  - Seed: 7 ikon proyek + resume.pdf + 6 app di posisi yang sama dengan desain Framer sekarang (diukur di 1280×800 dan 390×844).
- **Gambar ulang desktop:** ikon proyek dan resume.pdf milik Framer disembunyikan (CSS); lapisan kita (`public/desktop/`) dipasang di dalam "Drag Canvas" Framer supaya urutan tumpukan (di bawah jendela app dan dock) tetap sama. Tampilan ikon meniru Framer: foto berbingkai putih + bayangan, label putih 14px. Folder & PDF memakai gambar ikon bawaan template.
- **Klik ikon (publik & admin):** proyek → Finder di proyek itu; folder → Finder di kategori itu; resume → Finder Resume; foto/PDF → jendela pratinjau (Quick Look). Pengunjung boleh menggeser ikon (tidak disimpan), seperti perilaku Framer sekarang.
- **Mode edit — desktop:** geser ikon apa saja (termasuk app Framer) → posisi disimpan untuk layout yang sedang dilihat. Klik kanan area kosong: *Folder Baru*, *Proyek Baru*, *Upload Foto/File…*. Seret file dari komputer ke desktop: gambar → ikon foto, PDF → ikon file (upload ke Cloudinary `dockfolio/desktop`). Klik kanan ikon: *Buka*, *Ganti Nama* (inline), *Edit Detail…* (proyek), *Hapus*. Nama baru otomatis unik ("Folder Baru 2").
  - Hapus proyek = proyek dihapus dari database (dengan konfirmasi). Hapus folder = kategori dihapus (proyek di dalamnya tetap ada). Hapus foto/file = ikon dihapus; file di Cloudinary dibiarkan (sama seperti spec admin).
- **Mode edit — Finder:** klik kanan di folder: *Proyek Baru*; klik kanan proyek: *Buka, Ganti Nama, Edit Detail…, Tampilkan/Hapus dari Desktop, Hapus*; klik kanan folder di sidebar: *Ganti Nama, Hapus*; klik kanan sidebar kosong: *Folder Baru*. Seret gambar dari komputer ke tampilan proyek → ditambahkan ke preview (dan jadi thumbnail kalau masih kosong); ke tampilan folder → proyek baru berisi gambar itu.
- **Edit Detail…** membuka form admin yang sudah ada di jendela ala macOS (iframe, header admin disembunyikan). Setelah simpan/hapus, jendela tertutup dan desktop + Finder memuat ulang data.
- **Bilah mode edit** kecil di atas tengah: "Mode Edit", tombol *Panel*, *Lihat sebagai pengunjung*, *Keluar*.
- HP: mode edit tetap bisa menggeser ikon (posisi HP terpisah); menu klik kanan hanya untuk mouse. *(cukup untuk sekarang)*

## Bukan tujuan
- Membuat ulang app Framer, mengubah dock/menu bar.
- Folder bersarang (folder di dalam folder) — kategori tetap satu tingkat.
- Undo.

## Gagal kalau
- Situs publik berubah tampilan/perilaku selain ikon portofolio yang kini dari database.
- Pengunjung bisa mengubah sesuatu.
- Posisi yang digeser di admin tidak sama setelah reload / di situs publik.

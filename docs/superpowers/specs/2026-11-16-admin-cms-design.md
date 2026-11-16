# Admin / CMS untuk Dockfolio: desain

Tanggal: 2026-11-16
Ukuran: proyek (mengubah struktur proyek + fitur baru)

## Tujuan dan alasan
Pemilik portfolio ingin mengelola isi Finder (proyek, kategori, featured, About, Kontak, Resume) dari halaman admin, bukan dengan mengedit `finder/finder-data.json` secara manual. Untuk sekarang dijalankan **lokal**; nanti akan di-hosting. Data disimpan di **Neon** (Postgres), gambar di **Cloudinary**. Pemilik setuju proyek pindah ke **Next.js**.

## Tujuan (goals)
- Situs portfolio (desktop Framer + Finder baru) tetap tampil dan bekerja persis seperti sekarang, tapi Finder membaca data dari database.
- Halaman `/admin` yang dilindungi satu password, untuk:
  - **Proyek:** tambah, ubah, hapus, atur urutan. Kolomnya: nama, klien, tahun, kategori (bisa lebih dari satu), tag, ringkasan, challenge, solution, final thoughts, URL "Visit", thumbnail, dan gambar preview.
  - **Kategori:** tambah, ubah nama, hapus, atur urutan.
  - **Featured:** tandai proyek sebagai featured, pilih warna titik, dan atur urutannya.
  - **Profil:** About (nama, peran, avatar, paragraf), Kontak (email + daftar link), Resume (upload PDF atau isi URL).
- Upload gambar (dan PDF resume) ke Cloudinary dari admin.
- Satu perintah untuk menjalankan semuanya secara lokal: `npm run dev`.
- Siap di-deploy ke Vercel nanti tanpa mengubah arsitektur.

## Bukan tujuan (sekarang)
- Hosting/deploy (nanti).
- Banyak user, role, reset password, login sosial.
- Mengubah bagian situs Framer di luar Finder (Notes, Music, ikon desktop, dan lainnya).
- Mengelola ikon proyek di desktop Framer: tetap 7 ikon contoh. Ikon proyek yang namanya tidak ada di database tetap membuka Finder di tampilan default.

## Gagal kalau
- Situs publik rusak, lebih lambat terasa, atau Finder kosong karena database sedang tidur (Neon auto-suspend). Finder harus menampilkan pesan yang jelas kalau data gagal dimuat, bukan jendela kosong.
- Kredensial (URL database, secret Cloudinary, password admin) bocor ke browser.
- Perubahan di admin tidak langsung terlihat di Finder setelah reload.

## Batasan
- Ekspor Framer (`index.html`, `assets/`, `f2c-sw.js`) tidak diedit isinya, kecuali dua tag `<link>`/`<script>` yang sudah ada.
- Keamanan sederhana sesuai permintaan: satu password di `.env.local`, tanpa sistem akun. Tetap dasar yang wajar: password tidak dikirim ke browser, cookie `httpOnly`, dan semua aksi tulis dicek di server.
- `.env.local` tidak boleh masuk git. Proyek dibuatkan repo git sendiri di dalam folder `dockfolio/` dengan `.gitignore` (`.env*.local`, `node_modules`, `.next`). Repo git yang sekarang aktif adalah seluruh folder home, dan itu tidak cocok untuk proyek ini nanti di Vercel. *(keputusan saya)*

## Pendekatan
- **A. Server Node kecil + Neon.** Ringan, tapi pemilik lebih memilih Next.js.
- **B. Browser langsung ke Neon (Data API + Neon Auth).** Ditolak: aturan keamanan per baris rumit, database terbuka lewat REST, upload tetap butuh server.
- **C. Next.js (App Router) + Neon + Cloudinary (dipilih pemilik).** Satu aplikasi untuk situs, API publik, dan admin. Deploy ke Vercel nanti jadi lurus. Kekurangannya: struktur proyek berubah (file situs pindah ke `public/`) dan ada dependensi npm.

## Desain

### Struktur proyek
```
dockfolio/
  public/                 ← situs lama dipindah ke sini apa adanya
    index.html, assets/, f2c-sw.js, site-overrides.css
    finder/ (finder.js, finder-model.js, finder.css, preview.html, finder-data.json)
  app/
    api/finder/route.ts   ← GET publik: JSON berbentuk sama dengan finder-data.json
    admin/…               ← halaman admin (login, proyek, kategori, profil)
  lib/
    db.ts                 ← koneksi Neon (@neondatabase/serverless)
    finder-data.ts        ← baris database → JSON Finder (fungsi murni, dites)
    auth.ts               ← cek password + cookie
    cloudinary.ts         ← upload (signed, dari server)
  db/schema.sql, db/seed.ts   ← tabel + isi awal dari finder-data.json
  middleware.ts           ← lindungi /admin/* kecuali /admin/login
  next.config.ts          ← rewrite "/" → "/index.html"
  .env.local (tidak di-commit), .env.example
```
- `/` tetap menampilkan situs Framer (rewrite ke `public/index.html`). Tidak ada `app/page.tsx`.
- `finder.js` mengambil data dari `/api/finder`. Kalau gagal, tampil pesan "Data belum bisa dimuat. Coba lagi." dengan tombol coba lagi. `preview.html` tetap memakai `finder-data.json` sebagai data contoh offline.

### Database (Neon, proyek "Personally", branch `production`)
- `categories(id text pk, label text, sort int)`
- `projects(id text pk, name, client, year int, summary, challenge, solution, final_thoughts, url, thumbnail text, images text[], tags text[], categories text[], featured_color text null, featured_order int null, sort int, updated_at timestamptz)`
  - `id` = slug dari nama (otomatis, bisa diubah). Featured = `featured_color` terisi.
- `settings(key text pk, value jsonb)` dengan kunci `about`, `contact`, `resume`, dan `favorites`.
- Seed awal dari `finder-data.json` yang sekarang (7 proyek, 4 kategori, 3 featured), supaya situs langsung sama seperti sekarang.

### API publik
- `finder.js` mulai mengambil data begitu halaman dimuat (bukan saat Finder pertama kali diklik), supaya jeda bangun database Neon (±0,5–2 detik setelah lama tidak dipakai) tidak terasa di klik pertama. Kalau Finder dibuka sebelum data siap, tampil indikator memuat. Auto-suspend Neon dibiarkan default (gratis). *(keputusan saya)*
- `GET /api/finder`: membaca ketiga tabel dan menyusunnya lewat `lib/finder-data.ts` menjadi bentuk `{ favorites, categories, projects, featured, about, contact, resume }` yang sudah dipakai `finder.js`. Kategori di dalam proyek yang sudah dihapus dibuang dari output.
- Tidak di-cache (`dynamic = 'force-dynamic'`), supaya perubahan di admin langsung terlihat setelah reload.

### Admin
- `/admin/login`: form satu password. Benar → cookie `httpOnly`, `sameSite=lax`, berlaku 30 hari, berisi hash SHA-256 dari `ADMIN_PASSWORD`. Salah → pesan error.
- `middleware.ts` mengarahkan semua `/admin/*` tanpa cookie valid ke `/admin/login`. Semua Server Action juga mengecek cookie sendiri, karena middleware saja tidak cukup.
- `/admin` (Proyek): tabel proyek dengan thumbnail, nama, kategori, tahun, featured, dan tombol naik/turun urutan. Tombol "Proyek baru". Klik baris untuk membuka form edit.
- `/admin/projects/[id]`: form semua kolom. Kategori berupa checkbox, tag berupa input koma, Featured berupa toggle + pilihan warna (preset macOS: merah `#ff5f57`, oranye `#febc2e`, kuning `#ffd60a`, hijau `#28c840`, biru `#0a84ff`, ungu `#bf5af2`, abu `#8e8e93`). Thumbnail dan gambar preview bisa di-upload (banyak sekaligus), dihapus, dan diurutkan. Tombol Simpan dan Hapus (dengan konfirmasi).
- `/admin/categories`: daftar kategori dengan edit label, tambah, hapus, dan naik/turun. Menghapus kategori yang masih dipakai proyek meminta konfirmasi dan melepaskannya dari proyek tersebut.
- `/admin/profile`: About, Kontak, dan Resume (upload PDF ke Cloudinary atau tempel URL).
- Tampilan admin sederhana dan rapi dengan gaya yang sama seperti Finder (font sistem, aksen `#0a64ff`), memakai CSS biasa, tanpa library UI.
- Link "Lihat situs" ke `/` dan tombol Logout.

### Cloudinary
- Upload **langsung dari browser ke Cloudinary dengan tanda tangan dari server**: browser meminta signature ke route admin (`POST /api/admin/cloudinary-signature`, wajib login), lalu mengirim file langsung ke Cloudinary. Secret (`CLOUDINARY_URL`) tetap hanya di server. Alasannya: file tidak lewat server Next, jadi aman dari batas body Server Action (1 MB) dan batas fungsi Vercel (±4,5 MB) saat nanti di-hosting. *(keputusan saya)*
- Folder `dockfolio/projects/<id>` untuk gambar proyek dan `dockfolio/profile` untuk avatar dan resume.
- Yang disimpan di database adalah `secure_url`. Gambar contoh lama (URL framerusercontent) tetap URL biasa dan tetap jalan.
- Batas: gambar ≤ 10 MB (jpg/png/webp/gif), resume PDF ≤ 10 MB. Menghapus gambar di admin hanya menghapus URL dari database; file di Cloudinary dibiarkan (tidak ada penghapusan otomatis).

### Variabel lingkungan (`.env.local`, diisi pemilik)
- `DATABASE_URL`: connection string Neon (pooled)
- `ADMIN_PASSWORD`
- `CLOUDINARY_URL`: `cloudinary://<key>:<secret>@<cloud_name>`

### Tes
- `lib/finder-data.ts` dites (Vitest): bentuk output sama dengan `finder-data.json` sekarang, featured terurut, kategori yang sudah dihapus dibuang, dan nilai kosong aman.
- Tes model Finder yang ada (`node --test`) tetap jalan.
- Verifikasi di browser: situs `/` sama seperti sebelumnya, perubahan di admin tampil di Finder, login salah ditolak, dan `/admin` tanpa login dialihkan.

## Diputuskan pemilik
- Pindah ke Next.js.
- Data di Neon; gambar di Cloudinary.
- Login cukup satu password admin, tanpa enkripsi berlapis.
- Lokal dulu, hosting nanti.

## Keputusan saya (bisa dikoreksi)
- **Database memakai proyek Neon yang sudah ada, "Personally"** (`floral-cake-12638576`, region `aws-us-east-2`, branch `production`, database `neondb`) di org "Donny", bukan proyek baru. *(diminta pemilik, 2026-11-16)* Kesembilan tabel lama (auth_attempts, contact, experience, media_library, projects, showcase, site_settings, skills, testimonials) sudah dihapus, lalu diganti `categories`, `projects`, dan `settings` dari `db/schema.sql` + `db/seed.sql`. Data lama dicadangkan di branch `backup-sebelum-dockfolio-2026-11-16` (`br-wandering-credit-b56hk9ri`). Claude menulis `DATABASE_URL` ke `.env.local` saat membangun.
- Seed dari data contoh yang ada sekarang.
- Admin ditulis dengan CSS biasa, tanpa library UI.
- Gambar yang dihapus di admin tidak ikut dihapus dari Cloudinary.
- `next@16` (versi terbaru saat ini 16.4.x), TypeScript, npm.

## Diserahkan ke pembangun
Detail tata letak form admin, pesan error, dan nama komponen.

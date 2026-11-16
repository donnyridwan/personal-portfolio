# Finder baru ala macOS — desain singkat

Tanggal: 2026-11-15
Ukuran: perubahan kecil (satu komponen baru)

## Tujuan
Jendela Finder di situs Dockfolio dibuat seperti Finder asli di Mac, dengan sidebar tiga bagian:
1. **Atas (seperti Favorites):** About, Resume, Kontak.
2. **Projects:** folder kategori: Mobile App, Website, SaaS, Development.
3. **Featured (seperti Tags, dengan titik warna):** beberapa proyek terbaik.

Alasannya: portofolio lebih rapi per kategori dan terasa seperti Mac sungguhan. Isinya nanti akan diambil dari CMS, jadi data harus terpisah dari tampilan.

## Bukan tujuan (sekarang)
- Membuat CMS-nya.
- Melepas bagian situs lain dari kode Framer (Notes, Music, dan lainnya tetap seperti sekarang).
- Mengganti proyek contoh dengan proyek asli. Untuk sementara pakai 7 proyek contoh.

## Gagal kalau
- Bagian situs lain (dock, desktop, jendela lain) jadi rusak.
- Mengubah isi masih harus mengedit kode, bukan file data.

## Pendekatan
- **A. Finder baru berdiri sendiri, ditempel di atas situs (dipilih).** HTML/CSS/JS biasa dan satu file data. Gampang diubah dan siap disambungkan ke CMS. Animasi jendela ditiru, jadi mungkin terasa sedikit beda dari jendela Framer lain.
- B. Mengedit kode Framer yang sudah dibundel. Ditolak: kodenya minified, rapuh, dan datanya terkunci di CMS Framer.
- C. Membangun ulang seluruh situs. Ditolak: terlalu besar untuk kebutuhan ini.

## Desain
**File baru (di root proyek):**
- `finder/finder-data.json`: semua isi (favorites, kategori, proyek, featured).
- `finder/finder.js` dan `finder/finder.css`: jendela Finder.
- `index.html`: ditambah dua baris untuk memuat `finder.css` dan `finder.js`.

**Isi `finder-data.json`:**
- `favorites`: `{ id, label, icon, type: "about" | "resume" | "contact", ... }`
- `categories`: `{ id, label }` (Mobile App, Website, SaaS, Development)
- `projects`: `{ id, name, client, year, categories[], tags[], summary, challenge, solution, finalThoughts, thumbnail, images[], url }`
- `featured`: `{ projectId, color }` (merah, oranye, hijau, dan seterusnya)

Bentuknya sengaja datar seperti satu "collection" di CMS, supaya nanti cukup mengganti `fetch('finder/finder-data.json')` dengan URL API CMS.

**Perilaku:**
- Klik ikon Finder di dock: Finder baru terbuka, menampilkan kategori pertama. Finder lama tidak muncul lagi.
- Klik ikon proyek di desktop (Archline, Glaze, dan lainnya): Finder baru terbuka langsung di halaman detail proyek itu.
- Klik folder kategori: panel kanan menampilkan tampilan list (Name, Kind, Year) seperti Finder Mac.
- Klik proyek di list atau di Featured: halaman detail (gambar sampul, klien, tahun, deskripsi, kategori, preview, tantangan, solusi, kesimpulan). Tombol ‹ › untuk mundur dan maju.
- **About:** teks tentang kamu (sementara memakai teks About Me dari Notes).
- **Resume:** membuka `resume.pdf` yang sudah ada.
- **Kontak:** email dan link LinkedIn, Instagram, X (sementara memakai link dari menu bar).
- Jendela bisa digeser lewat title bar, tombol merah menutup, dan ada animasi buka/tutup sederhana.
- Di layar sempit (HP), jendela memenuhi layar dan sidebar bisa disembunyikan.

**Isian sementara (keputusan saya, gampang diganti di file data):**
- Website: Archline, Dewi, Nonsence, Creatory
- SaaS: Glaze, Nexmind®
- Development: BRND™
- Mobile App: kosong, dengan tulisan "Belum ada proyek" (seperti folder kosong di Mac)
- Featured: Archline (merah), Nexmind® (oranye), Glaze (hijau)

## Catatan
- Gambar detail proyek saat ini dimuat dari server Framer (`framerusercontent.com`) lewat internet, sama seperti Finder lama. Kalau server itu berhenti menyediakannya, gambar hilang. Gambar bisa diunduh ke folder lokal nanti (perlu persetujuanmu).
- Folder ini belum punya repo git sendiri; dokumen ini tidak di-commit.

## Diserahkan ke pembangun
Detail visual (ukuran, warna, ikon sidebar) mengikuti gaya Finder lama dan screenshot Finder Mac.

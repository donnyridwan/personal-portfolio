# Finder Baru ala macOS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ganti jendela Finder Framer dengan Finder buatan sendiri yang sidebarnya punya tiga bagian (Favorites, Projects per kategori, Featured berwarna), dengan semua isi dibaca dari satu file JSON.

**Architecture:** Komponen mandiri di `finder/`, dimuat dari `index.html` sebagai ES module. Logika data murni ada di `finder-model.js` (dites dengan `node --test`). Tampilan dan interaksi ada di `finder.js` + `finder.css`. Klik ikon Finder di dock dan ikon proyek di desktop dicegat pada fase capture, supaya Finder Framer tidak terbuka.

**Tech Stack:** HTML/CSS/JS biasa (ES modules), tanpa build step dan tanpa dependensi. Tes memakai Node 26 `node --test`. Server lokal: `python3 -m http.server 5173`.

**Spec:** `docs/superpowers/specs/2026-11-15-finder-sidebar-design.md`

## Global Constraints

- Tanpa Framer API, tanpa library tambahan, tanpa build step.
- Semua isi (label, proyek, kategori, warna) hanya berasal dari `finder/finder-data.json`; tidak ada teks konten yang ditulis langsung di JS.
- Data dimuat lewat satu fungsi `loadFinderData(url = 'finder/finder-data.json')`, supaya nanti bisa diganti URL API CMS.
- Bagian situs lain (desktop, dock, Notes, Music, dan lainnya) harus tetap jalan seperti sebelumnya.
- Kategori: `mobile-app` "Mobile App", `website` "Website", `saas` "SaaS", `development` "Development".
- Isian: Website = Archline, Dewi, Nonsence, Creatory; SaaS = Glaze, Nexmind®; Development = BRND™; Mobile App = kosong.
- Featured: Archline `#ff5f57` (merah), Nexmind® `#febc2e` (oranye), Glaze `#28c840` (hijau).
- Teks antarmuka berbahasa Indonesia: list kosong "Belum ada proyek"; resume kosong "Resume belum tersedia".
- Folder ini tidak punya repo git sendiri (root git = home directory): **jangan commit**. Langkah "Commit" diganti cek manual.

## Review Focus

1. **Finder dibuka saat sudah terbuka** (klik dock dua kali, atau klik proyek desktop saat Finder terbuka): harus memakai jendela yang sama dan pindah ke tampilan yang diminta, bukan membuat jendela kedua. Diuji di Task 3, Step 4.
2. **Ikon proyek di desktop digeser (drag):** menggeser tidak boleh membuka Finder; hanya tap (gerak < 5px) yang membuka. Diuji di Task 3, Step 4.
3. **Kategori kosong (Mobile App):** tampil "Belum ada proyek", tidak error. Diuji di Task 1 (`projectsInCategory`) dan Task 2, Step 3.
4. **Data rusak** (`featured` menunjuk `projectId` yang tidak ada, atau kategori proyek tidak dikenal): item itu dilewati dengan `console.warn` dan Finder tetap tampil. Diuji di Task 1 (`featuredProjects`, `validateData`).
5. **Gambar gagal dimuat** (offline, atau server Framer menolak): kotak abu-abu dengan ukuran tetap, layout tidak runtuh. Diuji di Task 2, Step 3.

---

### Task 1: Data dan model

**Files:**
- Create: `finder/finder-data.json`
- Create: `finder/finder-model.js`
- Test: `tests/finder-model.test.mjs`

**Interfaces:**
- Produces (semua di-export dari `finder/finder-model.js`):
  - `validateData(data) -> string[]`: daftar pesan masalah; kosong berarti valid.
  - `getProject(data, id) -> Project | null`
  - `projectsInCategory(data, categoryId) -> Project[]`: urutan sesuai `data.projects`.
  - `featuredProjects(data) -> Array<{ project: Project, color: string }>`: melewati id yang tidak ada.
  - `createHistory(initial: View) -> { current(): View, push(v: View): void, back(): View, forward(): View, canBack(): boolean, canForward(): boolean }`
  - Bentuk `View`: `{ type: 'category', id }` | `{ type: 'project', id }` | `{ type: 'about' }` | `{ type: 'resume' }` | `{ type: 'contact' }`

- [ ] **Step 1: Tulis `finder/finder-data.json`**

Kunci tingkat atas: `favorites`, `categories`, `projects`, `featured`, `about`, `contact`, `resume`.
- `favorites`: `[{ "id": "about", "label": "About", "icon": "person" }, { "id": "resume", "label": "Resume", "icon": "doc" }, { "id": "contact", "label": "Kontak", "icon": "mail" }]`
- `about`: `{ "name", "role", "avatar", "paragraphs": [] }`, disalin dari jendela Notes "About Me" di situs (buka dari dock, salin teksnya).
- `contact`: `{ "email": "", "links": [{ "label", "url" }] }`, berisi link LinkedIn, Instagram, dan X dari menu bar (ambil `href`-nya lewat devtools). Email dikosongkan.
- `resume`: `{ "url": "" }`. Ikon resume.pdf di desktop sekarang hanya menuju framer.com; tidak ada PDF lokal.
- `projects[]`: `{ id, name, client, year, categories[], tags[], summary, challenge, solution, finalThoughts, thumbnail, images[], url }` untuk 7 proyek. Isinya sudah dikumpulkan dari Finder lama, lihat lampiran di akhir rencana ini. `thumbnail` = gambar pertama, `images` = sisanya, `url` = `""`.

- [ ] **Step 2: Tulis tes yang gagal di `tests/finder-model.test.mjs`**

Memuat JSON asli lewat `JSON.parse(readFileSync(...))`.
```js
test('data asli valid', () => assert.deepEqual(validateData(data), []));
test('website berisi 4 proyek urut', () =>
  assert.deepEqual(projectsInCategory(data, 'website').map(p => p.id), ['archline','dewi','nonsence','creatory']));
test('mobile-app kosong', () => assert.deepEqual(projectsInCategory(data, 'mobile-app'), []));
test('featured urut dengan warna', () =>
  assert.deepEqual(featuredProjects(data).map(f => [f.project.id, f.color]),
    [['archline','#ff5f57'],['nexmind','#febc2e'],['glaze','#28c840']]));
test('featured id tak dikenal dilewati', () => {
  const d = structuredClone(data); d.featured.push({ projectId: 'nope', color: '#000' });
  assert.equal(featuredProjects(d).length, 3);
});
test('validateData melaporkan kategori tak dikenal dan featured rusak', () => {
  const d = structuredClone(data); d.projects[0].categories = ['xyz']; d.featured.push({ projectId: 'nope', color: '#000' });
  const errs = validateData(d);
  assert.ok(errs.some(e => e.includes('xyz'))); assert.ok(errs.some(e => e.includes('nope')));
});
test('history mundur dan maju', () => {
  const h = createHistory({ type: 'category', id: 'website' });
  h.push({ type: 'project', id: 'dewi' });
  assert.equal(h.canBack(), true); assert.deepEqual(h.back(), { type: 'category', id: 'website' });
  assert.deepEqual(h.forward(), { type: 'project', id: 'dewi' });
  h.back(); h.push({ type: 'about' }); assert.equal(h.canForward(), false);
});
```

- [ ] **Step 3: Jalankan, pastikan gagal**

Run: `node --test tests/`
Expected: FAIL karena `finder/finder-model.js` belum ada.

- [ ] **Step 4: Implementasi `finder/finder-model.js`**

Fungsi murni, tanpa DOM. Id proyek ditulis huruf kecil tanpa simbol (`nexmind`, `brnd`).

- [ ] **Step 5: Jalankan, pastikan lulus**

Run: `node --test tests/`
Expected: 7 tes PASS.

---

### Task 2: Jendela Finder (tampilan dan navigasi)

**Files:**
- Create: `finder/finder.css`
- Create: `finder/finder.js`
- Create: `finder/preview.html` (halaman uji: hanya memuat `finder.css` dan `finder.js` di atas latar polos)

**Interfaces:**
- Consumes: semua export dari Task 1.
- Produces (di `finder/finder.js`):
  - `export async function loadFinderData(url = 'finder/finder-data.json') -> data`
  - `export function openFinder(view?: View)`: membuka jendela atau, kalau sudah terbuka, memakai jendela yang sama lalu navigasi ke `view`. Default `{ type: 'category', id: data.categories[0].id }`.
  - `export function closeFinder()`
  - `window.dockfolioFinder = { open: openFinder, close: closeFinder }`

- [ ] **Step 1: Bangun kerangka jendela**

Root `<div id="df-finder">` di-append ke `document.body`, `position: fixed`, `z-index: 2147483000`. Isinya:
- title bar dengan tiga lampu (merah = tutup), tombol ‹ ›, dan judul tampilan aktif;
- sidebar dengan header bagian "Favorites", "Projects", "Featured";
- panel konten.

Ukuran 860×560 di tengah layar. Gaya meniru Finder lama: sidebar `#f2f2f2`, item aktif berlatar biru `#0a64ff` dengan teks putih, font `-apple-system, Inter, sans-serif` 13px, sudut jendela 12px, bayangan lembut. Ikon sidebar memakai SVG inline sederhana: folder untuk kategori, titik warna untuk featured, dan person/doc/mail untuk favorites. Semua class diberi prefix `df-` supaya tidak bentrok dengan CSS Framer.

- [ ] **Step 2: Render tampilan**

- `category`: tabel list dengan kolom Name (thumbnail 16px + nama), Kind (label kategori pertama), dan Year. Baris berselang warna; klik dua kali atau klik sekali membuka proyek. Kalau kosong, tampil "Belum ada proyek" di tengah.
- `project`: sama dengan Finder lama: header (thumbnail, nama, "Client: … • Year: …", tombol "Visit" hanya kalau `url` terisi), ringkasan, Category (tags dipisah "/"), Preview (`images`), Challenges, Solution, Final thoughts.
- `about`, `contact`, `resume`: dari kunci yang sama di data. Resume dengan `url` kosong menampilkan "Resume belum tersedia"; kalau ada, tampil `<iframe>` PDF plus link "Buka".

Navigasi lewat `createHistory`, dan tombol ‹ › nonaktif sesuai `canBack()`/`canForward()`. Item sidebar ditandai aktif sesuai tampilan; di tampilan `project` yang aktif adalah item Featured-nya kalau ada, kalau tidak kategori pertama proyek itu. Semua `<img>` punya `width`/`height` tetap dan latar `#e5e5e5`; saat `onerror`, `src` dibuang dan kotak abu-abu tetap tampil.

- [ ] **Step 3: Verifikasi di browser lewat `http://localhost:5173/finder/preview.html`**

`preview.html` memanggil `openFinder()` saat dimuat; fetch data memakai path relatif `finder-data.json`. Catatan: di halaman ini `loadFinderData('finder-data.json')`, di situs memakai default. Cek dengan screenshot:
- Website menampilkan 4 baris.
- Mobile App menampilkan "Belum ada proyek".
- Klik Dewi membuka detailnya; ‹ kembali ke Website, › maju lagi.
- Featured Glaze (titik hijau) membuka detail Glaze dan item Featured-nya aktif.
- About, Kontak, dan Resume ("Resume belum tersedia") tampil.
- Matikan jaringan (DevTools offline) lalu buka Nexmind®: kotak abu-abu tetap berukuran, layout utuh.

- [ ] **Step 4: Geser, tutup, dan layar sempit**

Title bar bisa di-drag dengan pointer events dan tetap di dalam viewport. Tombol merah dan Esc menutup jendela. Animasi buka: `scale(.96)→1` + `opacity 0→1` selama 180ms; animasi tutup kebalikannya. Di bawah 700px lebar: jendela `inset: 0` tanpa sudut, sidebar disembunyikan dan dibuka lewat tombol ☰ di title bar. Verifikasi dengan screenshot di 1280×800 dan 375×812.

---

### Task 3: Sambungkan ke situs

**Files:**
- Modify: `index.html` (tambah `<link rel="stylesheet" href="finder/finder.css">` sebelum `</head>` dan `<script type="module" src="finder/finder.js"></script>` sebelum `</body>`)
- Modify: `finder/finder.js` (tambah `installHooks()`, dipanggil otomatis saat dimuat di halaman yang punya `[data-framer-name="Dock Menu"]`)

**Interfaces:**
- Consumes: `openFinder`, `getProject`, data dari Task 1–2.
- Produces: `function installHooks(data)` (internal).

- [ ] **Step 1: Cegat klik**

Listener di `document` pada fase capture untuk `pointerdown`, `pointerup`, dan `click`. Target dikenali dari:
- **Dock Finder:** `a[data-framer-name="D-Small"]` di dalam `[data-framer-name="Dock Menu"]` yang punya `img[src*="jHPLi4pph6s8pBdTePue1xYLs"]` (ikon Finder, urutan pertama di dock).
- **Proyek di desktop:** elemen `[data-framer-name="Desktop/Horizontal"]` atau `[data-framer-name="Desktop/Vertical"]`. Nama proyek diambil dari `textContent.trim()`, lalu dicocokkan ke `project.name`.

Untuk target dock, panggil `stopPropagation()` dan `preventDefault()` di ketiga event, lalu `openFinder()`. Untuk target proyek desktop, simpan posisi `pointerdown` dan biarkan event itu lewat (supaya drag Framer tetap jalan). Pada `pointerup`, kalau jaraknya < 5px, `stopPropagation()` dan `openFinder({ type: 'project', id })`; kalau ≥ 5px, biarkan lewat. Juga hentikan `click` yang mengikutinya.

- [ ] **Step 2: Tambahkan tag ke `index.html`**

- [ ] **Step 3: Pastikan Finder Framer tidak muncul**

Kalau Framer tetap membuka overlay-nya (`[data-framer-name="Finder Overlay"]`) karena tap-nya terpicu dari event lain, tambahkan CSS `[data-framer-name="Finder Overlay"]{display:none!important}` di `finder.css`. Overlay itu khusus Finder lama, jadi jendela lain tidak terdampak. Verifikasi bahwa Notes (dock) dan Music (desktop) tetap terbuka normal.

- [ ] **Step 4: Verifikasi di `http://localhost:5173`**

Cek dengan screenshot:
- Klik Finder di dock: Finder baru terbuka di Website.
- Klik Finder lagi: tetap satu jendela (`document.querySelectorAll('#df-finder').length === 1`).
- Tap Archline di desktop: detail Archline terbuka di jendela yang sama.
- Drag Glaze 100px di desktop: ikon berpindah dan Finder tidak terbuka.
- Notes dan Music tetap terbuka seperti biasa.
- Console tanpa error baru.
- Jalankan lagi `node --test tests/`: tetap PASS.

---

## Lampiran: isi proyek contoh

Dikumpulkan dari Finder lama pada 2026-11-15. Gambar = URL `https://framerusercontent.com/images/<file>` (tanpa query; yang pertama dipakai sebagai thumbnail).

| id | name | client | year | tags | gambar |
|---|---|---|---|---|---|
| archline | Archline | Maisonluxe | 2025 | Web Design, Framer Development | EpE3EXTbHQgZGhvDOnYoCiOPO4Q.jpg, EymozPaAATTf6rydKIrqAIptRsU.jpg, FQo8E0jYggHvidGdQnZnNkIeIms.jpg, IMUNWYEfkn5T37D2j6dPFh4kYBo.jpg, 9uBDaRfp8jzIPpGe9xupADgkI.jpg |
| nexmind | Nexmind® | Simon Hale | 2025 | Brand Identity, Motion Graphics, 3D Design | EPRSL4XDvXGg2KRgMLqqktSo.png, N2RS74zXn9pmJpNEkbzk3HysSU.jpg, GCipfAigW5tdV27gbBuLhY2B9fk.png, Q9VWtO4xfyjoc8cc16ZRfTTzJk.jpg, OsGx3Pbiv9v4DdmU5YTBQjNLdg.png |
| dewi | Dewi | Alex Luu | 2025 | Brand Identity, Web Design | MZaxJjFtRo4mSnx24EjY6XllOg.png, lIte5WocdwZOBvMNrXRz6OdTos.png, u1FcPcPkmbTEkoXXiGYzyNCmPlU.jpg, tP36bF9dCnTuEzzQ2OJ66pAFwtE.jpg, rtmhvemWx36r95T3imM5QZfQ.jpg, kWJhJ7MBBejIH1wBhGGONDPw2o.jpg |
| creatory | Creatory | Wilson | 2023 | Web Design, Motion Graphics, 3D Design | BioZIG0GuLlZAIoshbFOCdctS7I.png, uqKjhjevbBLdejvNTpHOHdjRe8.png, RwJfvfA9ufwf6M2MM1DBM3p0UU.png, nmExbQeqjxRG57npvnCrrvhhfrI.jpg, CtDtwTfs20B0ZoX4YfKIx5DeTI.png |
| brnd | BRND™ | Jacob Olenick | 2024 | Web Design, Framer Development, Motion Graphics | r8zjZl4nPR79RdtcO521JQC2iw.png, vNCmGscmP8AZWPigQbWyz1UL4Hw.jpg, VFeozosSzLUoaMd4cqV75XTjjCM.jpg, dkLGf25J6u0rMKWEcoapWyfA4WQ.jpg, 1QbPIA8skAdl1OpVyHFL4xhiY8w.jpg |
| nonsence | Nonsence | Jamie | 2024 | Web Design, Motion Graphics | UJRysqwXqt9PEy3vxbN9XI5QXQ.png, BoGTMK7AaJPSwR19PrCWBEkIdU.jpeg, jR5nT4eidqPyGLPnkKhYwXBWTw.png, pXMCuNOhpqCYOzFtPKZBZcq86A.png |
| glaze | Glaze | Capi Agency | 2026 | Motion Graphics, 3D Design | adZOUatDWxd54qP773wJrAePo.jpg, ot3280OOVp3x550UVevzU70I.png, G0cUgOPzBFAmQ6OoZuDfxuUSvmw.jpg, TXb6XY1jscgFBvhuTnhJGTVEKXc.jpeg |

Teks summary, challenge, solution, dan finalThoughts tiap proyek disalin persis dari Finder lama (urutan di halaman: deskripsi di bawah header, lalu "Challenges:" pertama = challenge, "Challenges:" kedua = solution, lalu "Final thoughts:").

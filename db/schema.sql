-- Skema database Dockfolio (Neon Postgres).
-- Bentuk data mengikuti finder/finder-data.json; /api/finder menyusunnya kembali ke bentuk itu.

create table categories (
  id    text primary key,              -- slug, mis. "website"
  label text not null,                 -- "Website"
  sort  int  not null default 0
);

create table projects (
  id             text primary key,     -- slug dari nama, mis. "nexmind"
  name           text not null,
  client         text not null default '',
  year           int,
  summary        text not null default '',
  challenge      text not null default '',
  solution       text not null default '',
  final_thoughts text not null default '',
  url            text not null default '',            -- tombol "Visit"
  thumbnail      text not null default '',            -- URL gambar (Cloudinary/lainnya)
  images         text[] not null default '{}',        -- gambar preview, urut
  tags           text[] not null default '{}',        -- "Web Design", "3D Design", ...
  categories     text[] not null default '{}',        -- id kategori
  featured_color text,                                -- terisi = tampil di Featured
  featured_order int,
  sort           int not null default 0,
  updated_at     timestamptz not null default now()
);

-- about, contact, resume, favorites (JSON bebas)
create table settings (
  key   text primary key,
  value jsonb not null
);

-- Ikon desktop (lihat db/migrations/002-desktop.sql untuk isi awal).
create table desktop_items (
  id         text primary key default gen_random_uuid()::text,
  kind       text not null check (kind in ('project','folder','photo','file','app')),
  ref        text not null default '',
  label      text not null default '',
  src        text not null default '',
  x real, y real, mx real, my real,
  z          int  not null default 0,
  created_at timestamptz not null default now()
);

-- Pemakaian AI Terminal per hari (db/migrations/003-ai-usage.sql).
create table ai_usage (
  day   date not null,
  key   text not null,
  count int  not null default 0,
  primary key (day, key)
);

-- Isi detail proyek (db/migrations/004-project-body.sql).
alter table projects add column body jsonb;

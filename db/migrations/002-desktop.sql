-- Migrasi 002: ikon desktop yang bisa diatur dari admin.
-- Posisi = titik tengah ikon, pecahan lebar/tinggi layar (0-1). x,y layar >= 810px; mx,my HP.
create table if not exists desktop_items (
  id         text primary key default gen_random_uuid()::text,
  kind       text not null check (kind in ('project','folder','photo','file','app')),
  ref        text not null default '',   -- id proyek / id kategori / 'resume' / class container Framer
  label      text not null default '',   -- nama untuk photo/file/app (proyek & folder ikut namanya)
  src        text not null default '',   -- URL gambar/PDF untuk photo/file
  x real, y real, mx real, my real,
  z          int  not null default 0,
  created_at timestamptz not null default now()
);

insert into desktop_items (id,kind,ref,label,src,x,y,mx,my) values
  ('p-creatory','project','creatory','','',0.9102,0.15,0.741,0.4408),
  ('p-nonsence','project','nonsence','','',0.8,0.6,0.8205,0.7204),
  ('p-dewi','project','dewi','','',0.7699,0.33,0.5308,0.2998),
  ('p-nexmind','project','nexmind','','',0.6,0.24,0.759,0.1706),
  ('p-brnd','project','brnd','','',0.4801,0.48,0.4897,0.5403),
  ('p-archline','project','archline','','',0.2797,0.6,0.2205,0.5604),
  ('p-glaze','project','glaze','','',0.0801,0.17,0.1308,0.2002),
  ('file-resume','file','resume','resume.pdf','',0.25,0.36,0.25,0.31),
  ('app-showreel','app','framer-1sap26b-container','Showreel','',0.38,0.18,0.42,0.17),
  ('app-resources','app','framer-k7gyw2-container','Resources','',0.63,0.63,0.82,0.56),
  ('app-space-shooter','app','framer-22bmx-container','Space Shooter','',0.14,0.81,0.35,0.75),
  ('app-music','app','framer-1lsj76w-container','Music','',0.45,0.75,0.15,0.69),
  ('app-terminal','app','framer-jbsg02-container','Terminal','',0.93,0.59,0.83,0.31),
  ('app-cookies','app','framer-wqveqr-container','Cookies','',0.9,0.86,0.43,0.41)
on conflict (id) do nothing;

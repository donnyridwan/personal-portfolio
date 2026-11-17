-- Migrasi 005: pesan dari formulir "Get in touch" di app Contact (sebelumnya terkirim ke akun Framer pembuat template).
create table if not exists contact_messages (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  name       text not null default '',
  email      text not null default '',
  message    text not null default '',
  fields     jsonb not null default '{}'::jsonb,  -- semua isian apa adanya
  visitor    text not null default ''             -- hash IP (bukan IP mentah), untuk batas kiriman
);

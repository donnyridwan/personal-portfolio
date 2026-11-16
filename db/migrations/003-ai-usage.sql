-- Migrasi 003: hitungan pemakaian AI Terminal per hari (per pengunjung + total), untuk membatasi biaya.
create table if not exists ai_usage (
  day   date not null,
  key   text not null,          -- hash IP pengunjung, atau '__all__' untuk total harian
  count int  not null default 0,
  primary key (day, key)
);

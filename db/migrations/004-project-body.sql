-- Migrasi 004: isi detail proyek sebagai dokumen blok (JSON Tiptap), diedit di Finder mode edit.
-- Kolom lama (summary, challenge, solution, final_thoughts, images) tetap ada sebagai cadangan;
-- isinya diubah jadi blok awal oleh lib/blocks.ts → legacyToDoc (lihat scripts/backfill-body.ts).
alter table projects add column if not exists body jsonb;

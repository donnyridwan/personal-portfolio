// Sekali jalan: isi projects.body dari kolom lama untuk proyek yang belum punya body.
// Jalankan: npx tsx --env-file=.env.local scripts/backfill-body.ts
import { neon } from '@neondatabase/serverless';
import { legacyToDoc } from '../lib/blocks';

const sql = neon(process.env.DATABASE_URL!);
await sql.query('alter table projects add column if not exists body jsonb');
const rows = (await sql`select id, summary, images, challenge, solution, final_thoughts from projects where body is null`) as {
  id: string; summary: string; images: string[]; challenge: string; solution: string; final_thoughts: string;
}[];
for (const r of rows) {
  await sql`update projects set body = ${JSON.stringify(legacyToDoc(r))}::jsonb where id = ${r.id}`;
}
console.log(`body diisi untuk ${rows.length} proyek`);

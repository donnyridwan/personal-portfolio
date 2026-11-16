// GET /api/finder — data Finder dari Neon, bentuknya sama dengan public/finder/finder-data.json.
import { loadFinderData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await loadFinderData();
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[api/finder]', err);
    return Response.json(
      { error: 'Data belum bisa dimuat' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

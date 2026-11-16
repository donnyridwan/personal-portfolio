// GET /api/admin/session — 200 kalau sudah login (dipakai desktop.js untuk masuk mode edit).
import { adminRoute } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const GET = adminRoute(async () => ({ ok: true }));

// PATCH /api/admin/notes — simpan kanvas tab Experience / Services di app Notes. Body: { tab, body }.
import { adminRoute } from '@/lib/api';
import { saveNotesDoc, UserError } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export const PATCH = adminRoute(async body => {
  if (body.tab !== 'experience' && body.tab !== 'services') throw new UserError('Tab tidak dikenal.');
  await saveNotesDoc(body.tab, body.body);
  return { ok: true };
});

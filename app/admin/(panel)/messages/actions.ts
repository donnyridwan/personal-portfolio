'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { deleteContactMessage } from '@/lib/repo';

export async function deleteMessageAction(form: FormData) {
  await requireAdmin();
  await deleteContactMessage(Number(form.get('id')));
  revalidatePath('/admin/messages');
}

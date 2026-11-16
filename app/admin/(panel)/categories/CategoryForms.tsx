'use client';
import { submitWithoutReset } from '@/app/admin/submitWithoutReset';
import { useActionState, useEffect, useState } from 'react';
import { addCategoryAction, deleteCategoryAction, renameCategoryAction } from './actions';

export function AddCategoryForm() {
  const [state, action, pending] = useActionState(addCategoryAction, null);
  const [label, setLabel] = useState('');
  // Berhasil → kosongkan input; gagal → isian tetap ada.
  useEffect(() => { if (state?.ok) setLabel(''); }, [state]);
  return (
    <form onSubmit={submitWithoutReset(action)} className="adm-card">
      <div className="adm-upload-row">
        <input type="text" name="label" value={label} onChange={e => setLabel(e.target.value)}
          placeholder="Nama kategori baru, mis. Branding" required style={{ flex: 1 }} aria-label="Nama kategori baru" />
        <button className="adm-btn adm-primary" disabled={pending}>Tambah</button>
      </div>
      {state?.error && <p className="adm-error" role="alert" style={{ marginTop: 8 }}>{state.error}</p>}
    </form>
  );
}

export function RenameCategoryForm({ id, label }: { id: string; label: string }) {
  const [state, action, pending] = useActionState(renameCategoryAction, null);
  return (
    <form onSubmit={submitWithoutReset(action)} className="adm-upload-row">
      <input type="hidden" name="id" value={id} />
      <input type="text" name="label" defaultValue={label} required aria-label={`Nama kategori ${label}`} />
      <button className="adm-btn" disabled={pending}>Simpan</button>
      {state?.error && <span className="adm-error" role="alert">{state.error}</span>}
      {state?.ok && <span className="adm-ok" role="status">✓</span>}
    </form>
  );
}

export function DeleteCategoryForm({ id, label, used }: { id: string; label: string; used: number }) {
  return (
    <form
      action={deleteCategoryAction}
      className="adm-inline"
      onSubmit={e => {
        const msg = used
          ? `Kategori "${label}" dipakai ${used} proyek. Hapus dan lepaskan dari proyek tersebut?`
          : `Hapus kategori "${label}"?`;
        if (!confirm(msg)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="adm-btn adm-danger">Hapus</button>
    </form>
  );
}

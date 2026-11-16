'use client';
import { submitWithoutReset } from '@/app/admin/submitWithoutReset';
import { useActionState, useState } from 'react';
import ImageField from '@/app/admin/ImageField';
import type { About, Contact, Resume } from '@/lib/types';
import { saveProfileAction } from './actions';

type Props = { about: About; contact: Contact; resume: Resume };

export default function ProfileForm({ about, contact, resume }: Props) {
  const [state, action, pending] = useActionState(saveProfileAction, null);
  const [avatar, setAvatar] = useState(about.avatar ? [about.avatar] : []);
  const [resumeUrl, setResumeUrl] = useState(resume.url ? [resume.url] : []);
  const [links, setLinks] = useState(contact.links.length ? contact.links : [{ label: '', url: '' }]);

  const setLink = (i: number, key: 'label' | 'url', v: string) =>
    setLinks(links.map((l, k) => (k === i ? { ...l, [key]: v } : l)));

  return (
    <form onSubmit={submitWithoutReset(action)}>
      <input type="hidden" name="avatar" value={JSON.stringify(avatar)} />
      <input type="hidden" name="resume" value={JSON.stringify(resumeUrl)} />
      <input type="hidden" name="links" value={JSON.stringify(links)} />

      <div className="adm-card">
        <h2>About</h2>
        <div className="adm-grid2">
          <label className="adm-field"><span>Nama</span><input type="text" name="name" defaultValue={about.name ?? ''} /></label>
          <label className="adm-field"><span>Peran</span><input type="text" name="role" defaultValue={about.role ?? ''} /></label>
        </div>
        <div className="adm-field">
          <span className="adm-label">Avatar</span>
          <ImageField value={avatar} onChange={setAvatar} folder="dockfolio/profile" />
        </div>
        <label className="adm-field">
          <span>Paragraf <span className="adm-hint">— pisahkan paragraf dengan satu baris kosong</span></span>
          <textarea name="paragraphs" rows={10} defaultValue={(about.paragraphs ?? []).join('\n\n')} />
        </label>
      </div>

      <div className="adm-card">
        <h2>Kontak</h2>
        <label className="adm-field"><span>Email</span><input type="email" name="email" defaultValue={contact.email} placeholder="nama@contoh.com" /></label>
        <div className="adm-field">
          <span className="adm-label">Link</span>
          <div className="adm-rows">
            {links.map((l, i) => (
              <div className="adm-row" key={i}>
                <input type="text" placeholder="Label, mis. LinkedIn" value={l.label} onChange={e => setLink(i, 'label', e.target.value)} aria-label={`Label link ${i + 1}`} />
                <input type="url" placeholder="https://…" value={l.url} onChange={e => setLink(i, 'url', e.target.value)} aria-label={`URL link ${i + 1}`} />
                <button type="button" className="adm-btn adm-icon adm-danger" onClick={() => setLinks(links.filter((_, k) => k !== i))} aria-label={`Hapus link ${i + 1}`}>✕</button>
              </div>
            ))}
          </div>
          <div><button type="button" className="adm-btn" onClick={() => setLinks([...links, { label: '', url: '' }])}>+ Tambah link</button></div>
        </div>
      </div>

      <div className="adm-card">
        <h2>Resume</h2>
        <p className="adm-muted" style={{ marginTop: 0 }}>Upload PDF (maks. 10 MB) atau tempel URL. Kosong = Finder menampilkan &ldquo;Resume belum tersedia&rdquo;.</p>
        <ImageField value={resumeUrl} onChange={setResumeUrl} folder="dockfolio/profile" kind="pdf" />
      </div>

      {state?.error && <p className="adm-error" role="alert">{state.error}</p>}
      {state?.ok && <p className="adm-ok" role="status">{state.ok}</p>}
      <button className="adm-btn adm-primary" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan profil'}</button>
    </form>
  );
}

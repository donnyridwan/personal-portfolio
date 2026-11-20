'use client';
import { submitWithoutReset } from '@/app/admin/submitWithoutReset';
import { useActionState, useState } from 'react';
import ImageField from '@/app/admin/ImageField';
import ListEditor from '@/app/admin/ListEditor';
import type { AiSettings } from '@/lib/ai';
import type { About, Contact, Resume } from '@/lib/types';
import { saveProfileAction } from './actions';

type Props = { about: About; contact: Contact; resume: Resume; ai: AiSettings };

export default function ProfileForm({ about, contact, resume, ai }: Props) {
  const [state, action, pending] = useActionState(saveProfileAction, null);
  const [avatar, setAvatar] = useState(about.avatar ? [about.avatar] : []);
  const [resumeUrl, setResumeUrl] = useState(resume.url ? [resume.url] : []);
  const [links, setLinks] = useState(contact.links.length ? contact.links : [{ label: '', url: '' }]);
  const asRows = (list: object[] | undefined) =>
    (list ?? []).map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? '')])));
  const [stats, setStats] = useState(asRows(about.stats));
  const [jobs, setJobs] = useState(asRows(about.experience));
  const [quotes, setQuotes] = useState(asRows(about.testimonials));

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
          <span>Ringkasan <span className="adm-hint">— dibaca AI Terminal; pisahkan paragraf dengan satu baris kosong (tidak tampil di halaman About)</span></span>
          <textarea name="paragraphs" rows={10} defaultValue={(about.paragraphs ?? []).join('\n\n')} />
        </label>
      </div>

      <div className="adm-card">
        <h2>Halaman About</h2>
        <p className="adm-muted" style={{ marginTop: 0 }}>Tampil di app Notes → About me dan Finder → About. Bagian tanpa isi otomatis disembunyikan.</p>
        <label className="adm-field"><span>Judul besar</span><input type="text" name="headline" defaultValue={about.headline ?? ''} placeholder="I design products people can actually finish using." /></label>
        <label className="adm-field"><span>Subjudul</span><textarea name="subtitle" rows={2} defaultValue={about.subtitle ?? ''} /></label>
        <label className="adm-field"><span>Link &ldquo;Book a Call&rdquo; <span className="adm-hint">— mis. Calendly; kosong = membuka app Contact</span></span><input type="url" name="bookUrl" defaultValue={about.bookUrl ?? ''} placeholder="https://calendly.com/…" /></label>

        <h2 style={{ marginTop: 20 }}>Angka (&ldquo;Numbers that hold up&rdquo;)</h2>
        <label className="adm-field"><span>Subjudul</span><input type="text" name="statsIntro" defaultValue={about.statsIntro ?? ''} /></label>
        <ListEditor name="stats" value={stats} onChange={setStats} addLabel="Tambah angka" fields={[
          { key: 'value', label: 'Angka', width: '0 1 100px', placeholder: '4+' },
          { key: 'unit', label: 'Satuan', width: '0 1 90px', placeholder: 'Yrs' },
          { key: 'label', label: 'Keterangan', placeholder: 'Designing digital products' },
        ]} />

        <h2 style={{ marginTop: 20 }}>Pengalaman</h2>
        <label className="adm-field"><span>Subjudul</span><input type="text" name="experienceIntro" defaultValue={about.experienceIntro ?? ''} /></label>
        <ListEditor name="experience" value={jobs} onChange={setJobs} addLabel="Tambah pengalaman" fields={[
          { key: 'role', label: 'Peran' },
          { key: 'company', label: 'Perusahaan' },
          { key: 'period', label: 'Periode', width: '0 1 170px', placeholder: 'Feb 2024 – Present' },
          { key: 'summary', label: 'Ringkasan', textarea: true, width: '1 1 100%' },
        ]} />

        <h2 style={{ marginTop: 20 }}>Testimoni</h2>
        <p className="adm-muted" style={{ marginTop: 0 }}>Isi hanya dengan ulasan asli dari klien (mis. dari Upwork).</p>
        <ListEditor name="testimonials" value={quotes} onChange={setQuotes} addLabel="Tambah testimoni" fields={[
          { key: 'name', label: 'Nama' },
          { key: 'title', label: 'Jabatan / perusahaan' },
          { key: 'rating', label: 'Bintang (1–5)', width: '0 1 110px', placeholder: '5' },
          { key: 'quote', label: 'Kutipan', textarea: true, width: '1 1 100%' },
        ]} />
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

      <div className="adm-card">
        <h2>AI Terminal</h2>
        <p className="adm-muted" style={{ marginTop: 0 }}>
          Ikon Terminal di desktop membuka asisten AI yang menjawab pertanyaan pengunjung tentang kamu. AI membaca
          About, Kontak, semua proyek, dan catatan di bawah. Catatan ini tidak pernah tampil di situs, hanya dibaca AI.
        </p>
        <label className="adm-field"><span>Nama AI</span><input type="text" name="ai_name" defaultValue={ai.name} maxLength={40} placeholder="Donny AI" /></label>
        <label className="adm-field">
          <span>Tentang aku (untuk AI) <span className="adm-hint">— latar belakang, pengalaman kerja, skill & tools, cara kerja, ketersediaan/harga, hal yang tidak boleh dijawab</span></span>
          <textarea name="ai_knowledge" rows={12} maxLength={20000} defaultValue={ai.knowledge}
            placeholder={'Contoh:\n- Desainer produk 6 tahun, fokus SaaS & mobile app.\n- Pernah di …\n- Tools: Figma, Framer, …\n- Terbuka untuk proyek freelance mulai Januari.\n- Jangan sebutkan tarif; arahkan ke email.'} />
        </label>
      </div>

      {state?.error && <p className="adm-error" role="alert">{state.error}</p>}
      {state?.ok && <p className="adm-ok" role="status">{state.ok}</p>}
      <button className="adm-btn adm-primary" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan profil'}</button>
    </form>
  );
}

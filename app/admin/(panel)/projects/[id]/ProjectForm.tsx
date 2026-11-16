'use client';
import { submitWithoutReset } from '@/app/admin/submitWithoutReset';
import { useActionState, useState } from 'react';
import ImageField from '@/app/admin/ImageField';
import { slugify } from '@/lib/slug';
import type { ProjectRow } from '@/lib/types';
import { deleteProjectAction, saveProjectAction } from '../actions';

/** Warna titik Featured (preset macOS). */
const COLORS = [
  { value: '#ff5f57', label: 'Merah' },
  { value: '#febc2e', label: 'Oranye' },
  { value: '#ffd60a', label: 'Kuning' },
  { value: '#28c840', label: 'Hijau' },
  { value: '#0a84ff', label: 'Biru' },
  { value: '#bf5af2', label: 'Ungu' },
  { value: '#8e8e93', label: 'Abu' },
];

type Props = { project: ProjectRow; isNew: boolean; categories: { id: string; label: string }[] };

export default function ProjectForm({ project, isNew, categories }: Props) {
  const [state, action, pending] = useActionState(saveProjectAction, null);
  const [name, setName] = useState(project.name);
  const [id, setId] = useState(project.id);
  const [thumb, setThumb] = useState(project.thumbnail ? [project.thumbnail] : []);
  const [images, setImages] = useState(project.images);
  const [featured, setFeatured] = useState(!!project.featured_color);

  // Folder Cloudinary mengikuti id proyek (atau nama, untuk proyek baru).
  const folder = `dockfolio/projects/${slugify(id || name)}`;

  return (
    <>
      <form onSubmit={submitWithoutReset(action)}>
        <input type="hidden" name="originalId" value={isNew ? '' : project.id} />
        <input type="hidden" name="thumbnail" value={JSON.stringify(thumb)} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />

        <div className="adm-card">
          <div className="adm-grid2">
            <label className="adm-field">
              <span>Nama</span>
              <input type="text" name="name" value={name} onChange={e => setName(e.target.value)} required />
            </label>
            <label className="adm-field">
              <span>ID <span className="adm-hint">— dipakai di URL; kosongkan untuk otomatis dari nama</span></span>
              <input type="text" name="id" value={id} placeholder={slugify(name)} onChange={e => setId(e.target.value)} />
            </label>
          </div>
          <div className="adm-grid3">
            <label className="adm-field">
              <span>Klien</span>
              <input type="text" name="client" defaultValue={project.client} />
            </label>
            <label className="adm-field">
              <span>Tahun</span>
              <input type="number" name="year" min={1900} max={2100} defaultValue={project.year ?? ''} />
            </label>
            <label className="adm-field">
              <span>URL &ldquo;Visit&rdquo;</span>
              <input type="url" name="url" defaultValue={project.url} placeholder="https://…" />
            </label>
          </div>
          <div className="adm-field">
            <span className="adm-label">Kategori</span>
            <div className="adm-checks">
              {categories.map(c => (
                <label key={c.id}>
                  <input type="checkbox" name="categories" value={c.id} defaultChecked={project.categories.includes(c.id)} />
                  {c.label}
                </label>
              ))}
              {categories.length === 0 && <span className="adm-muted">Belum ada kategori.</span>}
            </div>
          </div>
          <label className="adm-field">
            <span>Tag <span className="adm-hint">— pisahkan dengan koma</span></span>
            <input type="text" name="tags" defaultValue={project.tags.join(', ')} placeholder="Web Design, Branding" />
          </label>
        </div>

        <div className="adm-card">
          <h2>Gambar</h2>
          <div className="adm-field">
            <span className="adm-label">Thumbnail</span>
            <ImageField value={thumb} onChange={setThumb} folder={folder} />
          </div>
          <div className="adm-field">
            <span className="adm-label">Preview <span className="adm-hint">— bisa banyak sekaligus, urutan = urutan tampil</span></span>
            <ImageField value={images} onChange={setImages} folder={folder} multiple />
          </div>
        </div>

        <div className="adm-card">
          <h2>Cerita proyek</h2>
          <label className="adm-field"><span>Ringkasan</span><textarea name="summary" defaultValue={project.summary} /></label>
          <label className="adm-field"><span>Challenge</span><textarea name="challenge" defaultValue={project.challenge} /></label>
          <label className="adm-field"><span>Solution</span><textarea name="solution" defaultValue={project.solution} /></label>
          <label className="adm-field"><span>Final thoughts</span><textarea name="final_thoughts" defaultValue={project.final_thoughts} /></label>
        </div>

        <div className="adm-card">
          <div className="adm-checks" style={{ marginBottom: 12 }}>
            <label>
              <input type="checkbox" name="featured" checked={featured} onChange={e => setFeatured(e.target.checked)} />
              <strong>Featured</strong> <span className="adm-hint">— tampil di bagian Featured sidebar Finder</span>
            </label>
          </div>
          {featured && (
            <div className="adm-swatches" role="radiogroup" aria-label="Warna titik">
              {COLORS.map(c => (
                <label key={c.value} title={c.label}>
                  <input type="radio" name="featured_color" value={c.value}
                    defaultChecked={(project.featured_color ?? '#0a84ff') === c.value} aria-label={c.label} />
                  <span style={{ background: c.value }} />
                </label>
              ))}
            </div>
          )}
        </div>

        {state?.error && <p className="adm-error" role="alert">{state.error}</p>}
        <div className="adm-actions">
          <button className="adm-btn adm-primary" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan'}</button>
          <span className="adm-spacer" />
        </div>
      </form>

      {!isNew && (
        <form
          action={deleteProjectAction}
          onSubmit={e => { if (!confirm(`Hapus proyek "${project.name}"? Ini tidak bisa dibatalkan.`)) e.preventDefault(); }}
          style={{ marginTop: 12 }}
        >
          <input type="hidden" name="id" value={project.id} />
          <button className="adm-btn adm-danger">Hapus proyek</button>
        </form>
      )}
    </>
  );
}

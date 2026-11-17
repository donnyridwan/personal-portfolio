import Link from 'next/link';
import { listCategories, listProjects } from '@/lib/repo';
import { displaySrc } from '@/lib/upload-client';
import MoveButtons from '../MoveButtons';
import { moveFeaturedAction, moveProjectAction } from './actions';

export const metadata = { title: 'Proyek · Donny Ridwan · Admin' };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [{ saved }, projects, categories] = await Promise.all([searchParams, listProjects(), listCategories()]);
  const catLabel = new Map(categories.map(c => [c.id, c.label]));
  const featured = projects
    .filter(p => p.featured_color)
    .sort((a, b) => (a.featured_order ?? 1e9) - (b.featured_order ?? 1e9) || a.sort - b.sort);

  return (
    <>
      <div className="adm-toprow">
        <h1>Proyek</h1>
        <Link href="/admin/projects/new" className="adm-btn adm-primary">+ Proyek baru</Link>
      </div>
      {saved && <p className="adm-ok" role="status">Tersimpan. Reload situs untuk melihat perubahan di Finder.</p>}

      {projects.length === 0 ? (
        <div className="adm-card adm-muted">Belum ada proyek.</div>
      ) : (
        <table className="adm-table">
          <thead>
            <tr><th></th><th>Nama</th><th>Kategori</th><th>Tahun</th><th>Featured</th><th>Urutan</th></tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={p.id}>
                <td>
                  {p.thumbnail
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img className="adm-thumb" src={displaySrc(p.thumbnail)} alt="" loading="lazy" />
                    : <span className="adm-thumb" />}
                </td>
                <td className="adm-name"><Link href={`/admin/projects/${encodeURIComponent(p.id)}`}>{p.name}</Link></td>
                <td>{p.categories.map(c => catLabel.get(c)).filter(Boolean).join(', ') || <span className="adm-muted">—</span>}</td>
                <td>{p.year ?? ''}</td>
                <td>{p.featured_color ? <span className="adm-dot" style={{ background: p.featured_color }} title="Featured" /> : ''}</td>
                <td className="adm-move">
                  <MoveButtons id={p.id} action={moveProjectAction} first={i === 0} last={i === projects.length - 1} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: 28 }}>Urutan Featured</h2>
      {featured.length === 0 ? (
        <div className="adm-card adm-muted">Belum ada. Aktifkan &ldquo;Featured&rdquo; di form proyek.</div>
      ) : (
        <table className="adm-table">
          <tbody>
            {featured.map((p, i) => (
              <tr key={p.id}>
                <td style={{ width: 24 }}><span className="adm-dot" style={{ background: p.featured_color! }} /></td>
                <td className="adm-name"><Link href={`/admin/projects/${encodeURIComponent(p.id)}`}>{p.name}</Link></td>
                <td className="adm-move">
                  <MoveButtons id={p.id} action={moveFeaturedAction} first={i === 0} last={i === featured.length - 1} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

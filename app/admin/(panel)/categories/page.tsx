import { listCategories } from '@/lib/repo';
import MoveButtons from '../MoveButtons';
import { moveCategoryAction } from './actions';
import { AddCategoryForm, DeleteCategoryForm, RenameCategoryForm } from './CategoryForms';

export const metadata = { title: 'Kategori · Donny Ridwan · Admin' };

export default async function CategoriesPage() {
  const cats = await listCategories();
  return (
    <>
      <h1>Kategori</h1>
      <p className="adm-muted">Kategori tampil sebagai folder di bagian Projects sidebar Finder, dengan urutan seperti di bawah.</p>
      <AddCategoryForm />
      {cats.length === 0 ? (
        <div className="adm-card adm-muted">Belum ada kategori.</div>
      ) : (
        <table className="adm-table">
          <thead><tr><th>Nama</th><th>ID</th><th>Proyek</th><th>Urutan</th><th></th></tr></thead>
          <tbody>
            {cats.map((c, i) => (
              <tr key={c.id}>
                <td><RenameCategoryForm id={c.id} label={c.label} /></td>
                <td className="adm-muted">{c.id}</td>
                <td>{c.used}</td>
                <td className="adm-move"><MoveButtons id={c.id} action={moveCategoryAction} first={i === 0} last={i === cats.length - 1} /></td>
                <td className="adm-move"><DeleteCategoryForm id={c.id} label={c.label} used={c.used} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

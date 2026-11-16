import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectRow, listCategories } from '@/lib/repo';
import type { ProjectRow } from '@/lib/types';
import ProjectForm from './ProjectForm';

const EMPTY: ProjectRow = {
  id: '', name: '', client: '', year: new Date().getFullYear(), summary: '', challenge: '', solution: '',
  final_thoughts: '', url: '', thumbnail: '', images: [], tags: [], categories: [], featured_color: null,
  featured_order: null, sort: 0,
};

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === 'new';
  const [project, categories] = await Promise.all([isNew ? EMPTY : getProjectRow(decodeURIComponent(id)), listCategories()]);
  if (!project) notFound();
  return (
    <>
      <p><Link href="/admin/projects">← Semua proyek</Link></p>
      <h1>{isNew ? 'Proyek baru' : project.name}</h1>
      <ProjectForm project={project} isNew={isNew} categories={categories.map(c => ({ id: c.id, label: c.label }))} />
    </>
  );
}

// Baris desktop_items → ikon siap tampil. Fungsi murni (dites di tests/desktop.test.ts).
import type { DesktopItem, DesktopRow } from './types';

type ProjectRef = { id: string; name: string; thumbnail: string };
type CategoryRef = { id: string; label: string };

export function buildDesktop(
  rows: DesktopRow[],
  projects: ProjectRef[],
  categories: CategoryRef[],
  resumeUrl: string,
): DesktopItem[] {
  const proj = new Map(projects.map(p => [p.id, p]));
  const cats = new Map(categories.map(c => [c.id, c]));
  const out: DesktopItem[] = [];
  for (const r of [...rows].sort((a, b) => a.z - b.z)) {
    const base = { ...r, label: r.label ?? '', src: r.src ?? '', img: '' };
    if (r.kind === 'project') {
      const p = proj.get(r.ref);
      if (p) out.push({ ...base, label: p.name, img: p.thumbnail ?? '' });
    } else if (r.kind === 'folder') {
      const c = cats.get(r.ref);
      if (c) out.push({ ...base, label: c.label });
    } else if (r.kind === 'file') {
      out.push(r.ref === 'resume' ? { ...base, label: base.label || 'resume.pdf', src: resumeUrl } : base);
    } else if (r.kind === 'photo') {
      out.push({ ...base, img: base.src });
    } else {
      out.push(base);
    }
  }
  return out;
}

/** Posisi pecahan 0–1; nilai bukan angka → null (ditaruh otomatis). */
export function clampPos(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  return Math.min(1, Math.max(0, v));
}

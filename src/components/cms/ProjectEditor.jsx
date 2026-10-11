import React, { useLayoutEffect, useRef, useState } from 'react';
import MediaUploader from './MediaUploader';
import CaseStudyFields from './CaseStudyFields';
import BlockEditor from './BlockEditor';
import { slugify, validateSlug } from '../../lib/slug';
import { normalizeCaseStudy } from '../../lib/blocks';
import { projectPath } from '../../lib/route';
import { getProjectSlug } from '../../lib/projects';

export default function ProjectEditor({ project, existingSlugs = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: project?.id || `project-${Date.now()}`,
    title: project?.title || '',
    category: project?.category || 'UI/UX Design',
    year: project?.year || new Date().getFullYear().toString(),
    span: project?.span || 'short',
    role: project?.role || 'Lead Product Designer',
    description: project?.description || '',
    tools: Array.isArray(project?.tools) ? project.tools : ['Figma', 'Prototyping'],
    accentColor: project?.accentColor || '#e7eef0',
    image: project?.image || '',
    video: project?.video || '',
    mediaType: project?.mediaType || (project?.video ? 'video' : 'image'),
    published: project?.published !== false,
    slug: project?.slug || slugify(project?.title || ''),
    caseStudy: normalizeCaseStudy(project?.caseStudy),
  });
  // New projects follow the title until the slug is edited by hand; saved projects keep their URL
  const [slugTouched, setSlugTouched] = useState(Boolean(project?.slug));

  const slugError = validateSlug(formData.slug, existingSlugs, project ? getProjectSlug(project) : '');
  const liveUrlError =
    formData.caseStudy.liveUrl && !/^https?:\/\//.test(formData.caseStudy.liveUrl)
      ? 'URL harus diawali http:// atau https://'
      : null;

  const handleTitleChange = (title) => {
    setFormData((prev) => ({ ...prev, title, slug: slugTouched ? prev.slug : slugify(title) }));
  };

  const handleCaseStudyChange = (patch) => {
    if ('slug' in patch) {
      setSlugTouched(true);
      setFormData((prev) => ({ ...prev, slug: patch.slug }));
      return;
    }
    setFormData((prev) => ({ ...prev, caseStudy: { ...prev.caseStudy, ...patch } }));
  };

  const [toolInput, setToolInput] = useState('');

  // The sidebar sticks below the CMS top bar (64px) and this editor's sticky header
  const headerRef = useRef(null);
  const [sidebarTop, setSidebarTop] = useState(64 + 120 + 16);
  useLayoutEffect(() => {
    const node = headerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => setSidebarTop(64 + node.offsetHeight + 16);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleAddTool = () => {
    if (!toolInput.trim()) return;
    if (!formData.tools.includes(toolInput.trim())) {
      setFormData({ ...formData, tools: [...formData.tools, toolInput.trim()] });
    }
    setToolInput('');
  };

  const handleRemoveTool = (toolToRemove) => {
    setFormData({
      ...formData,
      tools: formData.tools.filter((t) => t !== toolToRemove),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul project wajib diisi');
      return;
    }
    if (slugError || liveUrlError) {
      alert(`Periksa lagi: ${slugError || liveUrlError}`);
      return;
    }
    onSave(formData);
  };

  return (
    <div className="w-full flex flex-col font-sans animate-fade-in" style={{ '--sidebar-top': `${sidebarTop}px` }}>
      {/* Sticky header: Simpan stays reachable while scrolling long block lists */}
      <div
        ref={headerRef}
        className="sticky top-[64px] z-20 -mx-6 lg:-mx-8 -mt-6 lg:-mt-8 px-6 lg:px-8 py-4 mb-6 bg-[#fafafb]/95 backdrop-blur border-b border-[#e5e5e7] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex flex-col gap-1 min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="text-[12.5px] text-[#737373] hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer w-fit font-medium group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Kembali ke Daftar Projects</span>
          </button>
          <h2 className="font-serif font-normal text-[26px] leading-tight text-[#171717] tracking-tight truncate">
            {project ? `Edit: ${formData.title || project.title}` : 'Tambah Project Baru'}
          </h2>
          <p className="text-[12.5px] text-[#737373]">
            Tersimpan ke Neon PostgreSQL Database
            {project?.slug && (
              <>
                {' · '}
                <a
                  href={projectPath(project.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#171717] underline underline-offset-4 decoration-1 hover:opacity-70"
                >
                  Lihat halaman ↗
                </a>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-[#e5e5e7] hover:border-black text-[13px] text-[#555] hover:text-black transition-colors cursor-pointer rounded-none"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-dark-glow px-6 py-2 rounded-none text-white text-[13px] font-medium cursor-pointer"
          >
            Simpan ke Neon DB
          </button>
        </div>
      </div>

      {/* Two columns on desktop: content blocks 70% left, project info 30% right.
          Info comes first in the DOM so phones (single column) show title/slug before blocks. */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)] gap-6 items-start"
      >
        {/* Project info sidebar */}
        <aside
          data-lenis-prevent
          className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-[var(--sidebar-top)] lg:max-h-[calc(100vh_-_var(--sidebar-top)_-_16px)] lg:overflow-y-auto lg:pr-1"
        >
          <Panel title="Info Project">
              <div className="flex flex-col">
                <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                  Judul Project *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Contoh: EvalNow: Educational UX"
                  className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                  Kategori
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Contoh: EdTech & SaaS"
                  className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                  Tahun
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2025"
                  className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                  Ukuran Grid (Span)
                </label>
                <select
                  value={formData.span}
                  onChange={(e) => setFormData({ ...formData, span: e.target.value })}
                  className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
                >
                  <option value="short">Short Card (365px)</option>
                  <option value="tall">Tall Card (605px)</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                  Warna Aksen Card
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-10 h-10 border border-[#e5e5e7] p-0.5 rounded-none cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="flex-1 bg-[#f8f8fa] border border-[#e5e5e7] px-3 py-2 text-[13px] text-[#171717] focus:outline-none focus:border-black rounded-none font-mono"
                  />
                </div>
              </div>
          </Panel>

          <Panel title="Cover">
              <MediaUploader
                value={formData.mediaType === 'video' ? formData.video : formData.image}
                mediaType={formData.mediaType}
                // Functional updates: the upload resolves later and must not roll back newer edits
                onMediaTypeChange={(type) => setFormData((prev) => ({ ...prev, mediaType: type }))}
                onChange={(url) =>
                  setFormData((prev) => (prev.mediaType === 'video' ? { ...prev, video: url } : { ...prev, image: url }))
                }
              />
          </Panel>

          <Panel title="Case Study Info" description="Ditampilkan di bagian atas halaman detail project.">
            <CaseStudyFields
              value={{ slug: formData.slug, ...formData.caseStudy }}
              onChange={handleCaseStudyChange}
              slugError={slugError}
              liveUrlError={liveUrlError}
            />
          </Panel>

          <Panel title="Detail">
          <div className="flex flex-col">
            <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
              Role / Tanggung Jawab
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Lead Product Designer"
              className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
              Deskripsi Proyek & Tantangan UX
            </label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ceritakan overview, tantangan desain, dan solusi yang diimplementasikan..."
              className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none resize-none leading-relaxed"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
              Tools & Spesialisasi
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTool();
                  }
                }}
                placeholder="Ketik tool, tekan Enter"
                className="flex-1 min-w-0 bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13px] text-[#171717] focus:outline-none focus:border-black rounded-none"
              />
              <button
                type="button"
                onClick={handleAddTool}
                className="px-3.5 py-2 bg-[#171717] shrink-0 text-white text-[12.5px] font-medium rounded-none hover:bg-black cursor-pointer"
              >
                + Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tools.map((t, idx) => (
                <span
                  key={idx}
                  className="bg-[#efeeec] text-[#222] px-3 py-1 text-[12px] flex items-center gap-2 border border-[#e0dfdc]"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(t)}
                    className="text-[#888] hover:text-red-600 font-bold ml-1 cursor-pointer"
                    title="Hapus"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          </Panel>
        </aside>

        {/* Content blocks: the main editing area */}
        <section className="lg:col-start-1 lg:row-start-1 bg-white border border-[#e5e5e7] shadow-sm p-5 sm:p-7 flex flex-col gap-6 min-w-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h3 className="font-serif text-[26px] text-[#171717] tracking-tight">Content Blocks</h3>
              <span className="text-[11px] font-medium px-2 py-0.5 bg-[#efeeec] text-[#555]">
                {formData.caseStudy.blocks.length} block
              </span>
            </div>
            <p className="text-[12.5px] text-[#737373]">
              Susun isi case study. Geser ⋮⋮ atau pakai ↑/↓ untuk mengubah urutan. Block kosong tidak ditampilkan.
            </p>
          </div>
          <BlockEditor
            blocks={formData.caseStudy.blocks}
            onChange={(update) =>
              setFormData((prev) => ({ ...prev, caseStudy: { ...prev.caseStudy, blocks: update(prev.caseStudy.blocks) } }))
            }
          />
        </section>
      </form>
    </div>
  );
}

function Panel({ title, description, children }) {
  return (
    <div className="bg-white border border-[#e5e5e7] shadow-sm p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.66px] text-[#171717]">{title}</h3>
        {description && <p className="text-[12px] text-[#737373]">{description}</p>}
      </div>
      {children}
    </div>
  );
}

import React, { useState } from 'react';
import MediaUploader from './MediaUploader';

export default function ProjectEditor({ project, onSave, onCancel }) {
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
  });

  const [toolInput, setToolInput] = useState('');

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
    onSave(formData);
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans animate-fade-in">
      {/* Page Header with Breadcrumb / Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e5e5e7]">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onCancel}
            className="text-[12.5px] text-[#737373] hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer w-fit mb-1 font-medium group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Kembali ke Daftar Projects</span>
          </button>
          <h2 className="font-serif font-normal text-[30px] text-[#171717] tracking-tight">
            {project ? `Edit: ${formData.title || project.title}` : 'Tambah Project Baru'}
          </h2>
          <p className="text-[13px] text-[#737373]">
            Data dan media akan tersimpan langsung ke Neon PostgreSQL Database.
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

      {/* Main Page Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#e5e5e7] p-6 sm:p-8 flex flex-col gap-6 w-full shadow-sm">
        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col">
            <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
              Judul Project *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
        </div>

        {/* Year, Grid Span & Accent Color */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
        </div>

        {/* Media Asset (Image or Video) via Cloudinary */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373]">
            Media Asset (Gambar / Video Cloudinary)
          </label>
          <div className="border border-[#e5e5e7] p-5 bg-[#fafafa]">
            <MediaUploader
              value={formData.mediaType === 'video' ? formData.video : formData.image}
              mediaType={formData.mediaType}
              onMediaTypeChange={(type) => setFormData({ ...formData, mediaType: type })}
              onChange={(url) => {
                if (formData.mediaType === 'video') {
                  setFormData({ ...formData, video: url });
                } else {
                  setFormData({ ...formData, image: url });
                }
              }}
            />
          </div>
        </div>

        {/* Role & Description */}
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

        {/* Tools & Tags */}
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
              placeholder="Ketik tool dan tekan Enter (contoh: Figma, React, Prototyping)"
              className="flex-1 bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13px] text-[#171717] focus:outline-none focus:border-black rounded-none"
            />
            <button
              type="button"
              onClick={handleAddTool}
              className="px-5 py-2 bg-[#171717] text-white text-[12.5px] font-medium rounded-none hover:bg-black cursor-pointer"
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

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-[#eeeeee]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[13px] text-[#737373] hover:text-black transition-colors cursor-pointer"
          >
            ← Batal & Kembali
          </button>
          <button
            type="submit"
            className="btn-dark-glow px-7 py-2.5 rounded-none text-white text-[13.5px] font-medium cursor-pointer"
          >
            Simpan ke Neon DB →
          </button>
        </div>
      </form>
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#e5e5e7] w-full max-w-[680px] my-8 p-6 sm:p-8 flex flex-col font-sans max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#eeeeee]">
          <div>
            <h3 className="font-serif font-normal text-[24px] text-[#171717]">
              {project ? 'Edit Project' : 'Tambah Project Baru'}
            </h3>
            <p className="text-[12px] text-[#737373]">
              Informasi project akan tersimpan langsung di Neon Database.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-[20px] text-[#888] hover:text-black p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                Judul Project *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: EvalNow: Educational UX"
                className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13px] text-[#171717] focus:outline-none focus:border-black rounded-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Contoh: EdTech & SaaS"
                className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13px] text-[#171717] focus:outline-none focus:border-black rounded-none"
              />
            </div>
          </div>

          {/* Year & Span */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                Tahun
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2025"
                className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13px] text-[#171717] focus:outline-none focus:border-black rounded-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                Ukuran Grid (Span)
              </label>
              <select
                value={formData.span}
                onChange={(e) => setFormData({ ...formData, span: e.target.value })}
                className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13px] text-[#171717] focus:outline-none focus:border-black rounded-none"
              >
                <option value="short">Short Card (365px)</option>
                <option value="tall">Tall Card (605px)</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                Warna Aksen Card
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-9 h-9 border border-[#e5e5e7] p-0.5 rounded-none cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1 bg-[#f8f8fa] border border-[#e5e5e7] px-2.5 py-2 text-[12px] text-[#171717] focus:outline-none focus:border-black rounded-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Media Uploader (Cloudinary) */}
          <div className="border border-[#e5e5e7] p-4 bg-[#fafafa]">
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

          {/* Role & Description */}
          <div className="flex flex-col">
            <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
              Role / Tanggung Jawab
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Lead Product Designer"
              className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13px] text-[#171717] focus:outline-none focus:border-black rounded-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
              Deskripsi Proyek
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ceritakan overview, tantangan, dan solusi UX..."
              className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13px] text-[#171717] focus:outline-none focus:border-black rounded-none resize-none leading-relaxed"
            />
          </div>

          {/* Tools / Tags */}
          <div className="flex flex-col">
            <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
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
                placeholder="Ketik tool dan tekan Enter (contoh: Figma)"
                className="flex-1 bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-1.5 text-[13px] text-[#171717] focus:outline-none focus:border-black rounded-none"
              />
              <button
                type="button"
                onClick={handleAddTool}
                className="px-4 py-1.5 bg-[#171717] text-white text-[12px] font-medium rounded-none hover:bg-black"
              >
                + Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {formData.tools.map((t, idx) => (
                <span
                  key={idx}
                  className="bg-[#efeeec] text-[#333] px-2.5 py-1 text-[11.5px] flex items-center gap-1.5"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(t)}
                    className="text-[#888] hover:text-red-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eeeeee]">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 border border-[#e5e5e7] text-[13px] text-[#555] hover:bg-neutral-100 rounded-none"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-dark-glow px-6 py-2 rounded-none text-white text-[13px] font-medium"
            >
              Simpan ke Neon DB
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

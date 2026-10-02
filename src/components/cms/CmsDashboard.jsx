import React, { useState, useEffect } from 'react';
import ProjectEditor from './ProjectEditor';
import { saveToNeon, fetchPortfolioFromNeon } from '../../lib/neon';
import { getCloudinaryConfig, saveCloudinaryConfig } from '../../lib/cloudinary';

export default function CmsDashboard({ portfolio, onUpdatePortfolio, onExitCms }) {
  const [activeTab, setActiveTab] = useState('projects');
  const [data, setData] = useState(portfolio);
  const [editingProject, setEditingProject] = useState(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ state: 'connected', msg: 'Neon DB Connected' });
  const [toast, setToast] = useState(null);

  // Cloudinary settings local state
  const [cloudinaryConfig, setCloudinaryConfig] = useState(getCloudinaryConfig());

  // Experience modal/inline edit state
  const [editingExp, setEditingExp] = useState(null);

  // Testimonial modal/inline edit state
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Support returning to list views with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editingExp) setEditingExp(null);
        if (editingTestimonial) setEditingTestimonial(null);
        if (isAddingProject) setIsAddingProject(false);
        if (editingProject) setEditingProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingExp, editingTestimonial, isAddingProject, editingProject]);

  // Sync latest from Neon on mount
  useEffect(() => {
    const loadFromDb = async () => {
      try {
        const fresh = await fetchPortfolioFromNeon();
        if (fresh) {
          setData(fresh);
          onUpdatePortfolio(fresh);
          setSyncStatus({ state: 'connected', msg: 'Neon DB Synced' });
        }
      } catch (e) {
        setSyncStatus({ state: 'fallback', msg: 'Using Local Cache' });
      }
    };
    loadFromDb();
  }, []);

  // 1. Projects handlers
  const handleSaveProject = async (proj) => {
    setIsSyncing(true);
    try {
      await saveToNeon('project', proj);
      const updatedProjects = data.projects.some((p) => p.id === proj.id)
        ? data.projects.map((p) => (p.id === proj.id ? proj : p))
        : [...data.projects, proj];

      const nextData = { ...data, projects: updatedProjects };
      setData(nextData);
      onUpdatePortfolio(nextData);
      setEditingProject(null);
      setIsAddingProject(false);
      notify('Project berhasil disimpan ke Neon Database!');
    } catch (e) {
      alert('Gagal menyimpan ke Neon: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Yakin ingin menghapus project ini dari Neon DB?')) return;
    setIsSyncing(true);
    try {
      await saveToNeon('delete_project', { id });
      const nextData = { ...data, projects: data.projects.filter((p) => p.id !== id) };
      setData(nextData);
      onUpdatePortfolio(nextData);
      notify('Project dihapus dari database.');
    } catch (e) {
      alert('Gagal menghapus: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. Profile handlers
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      const profile = {
        name: data.name,
        title: data.title,
        bio: data.bio,
        email: data.email,
        phone: data.phone,
        socials: data.socials,
      };
      await saveToNeon('profile', profile);
      onUpdatePortfolio(data);
      notify('Profile & Contact berhasil diperbarui di Neon DB!');
    } catch (e) {
      alert('Gagal menyimpan profile: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Stats handlers
  const handleSaveStats = async (e) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      await saveToNeon('stats', data.stats);
      onUpdatePortfolio(data);
      notify('Data "The Proof" angka berhasil disimpan ke Neon!');
    } catch (e) {
      alert('Gagal menyimpan stats: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. Experience handlers
  const handleSaveExperience = async (exp) => {
    setIsSyncing(true);
    try {
      await saveToNeon('experience', exp);
      const updatedExp = data.experience.some((e) => e.id === exp.id)
        ? data.experience.map((e) => (e.id === exp.id ? exp : e))
        : [...data.experience, exp];

      const nextData = { ...data, experience: updatedExp };
      setData(nextData);
      onUpdatePortfolio(nextData);
      setEditingExp(null);
      notify('Experience berhasil disimpan ke Neon!');
    } catch (e) {
      alert('Gagal menyimpan experience: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!confirm('Hapus timeline experience ini?')) return;
    setIsSyncing(true);
    try {
      await saveToNeon('delete_experience', { id });
      const nextData = { ...data, experience: data.experience.filter((e) => e.id !== id) };
      setData(nextData);
      onUpdatePortfolio(nextData);
      notify('Experience dihapus dari database.');
    } catch (e) {
      alert('Gagal menghapus: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. Testimonial handlers
  const handleSaveTestimonial = async (test) => {
    setIsSyncing(true);
    try {
      await saveToNeon('testimonial', test);
      const updated = data.testimonials.some((t) => t.id === test.id)
        ? data.testimonials.map((t) => (t.id === test.id ? test : t))
        : [...data.testimonials, test];

      const nextData = { ...data, testimonials: updated };
      setData(nextData);
      onUpdatePortfolio(nextData);
      setEditingTestimonial(null);
      notify('Testimonial berhasil disimpan ke Neon!');
    } catch (e) {
      alert('Gagal menyimpan testimonial: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!confirm('Hapus testimonial ini?')) return;
    setIsSyncing(true);
    try {
      await saveToNeon('delete_testimonial', { id });
      const nextData = { ...data, testimonials: data.testimonials.filter((t) => t.id !== id) };
      setData(nextData);
      onUpdatePortfolio(nextData);
      notify('Testimonial dihapus dari database.');
    } catch (e) {
      alert('Gagal menghapus: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // 6. Cloudinary settings save
  const handleSaveCloudinary = async (e) => {
    e.preventDefault();
    saveCloudinaryConfig(cloudinaryConfig);
    try {
      await saveToNeon('cloudinary', cloudinaryConfig);
      notify('Pengaturan Cloudinary tersimpan!');
    } catch {
      notify('Pengaturan Cloudinary tersimpan di browser!');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafb] text-[#171717] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-[64px] bg-white border-b border-[#e5e5e7] px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <img src="./assets/logo.png" alt="" className="h-[24px] w-auto" />
          <span className="font-serif font-medium text-[16px] text-black">
            Donny Studio CMS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExitCms}
            className="px-3.5 py-1.5 bg-[#f5f5f7] border border-[#e5e5e7] text-[12px] font-medium text-[#444] hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            Lihat Website ↗
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('cms_auth_token');
              window.location.hash = 'work';
              window.location.reload();
            }}
            className="text-[12px] text-[#888] hover:text-red-600 px-2 py-1 cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main Layout - Full Width */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        {/* CMS Sidebar Navigation */}
        <aside className="w-full md:w-[230px] bg-white border-r border-[#e5e5e7] p-4 flex md:flex-col gap-1 overflow-x-auto shrink-0">
          <div className="hidden md:block text-[10.5px] uppercase tracking-[0.8px] text-[#a3a3a3] font-medium px-3 pt-2 pb-1.5">
            Manajemen Konten
          </div>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-left transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-black text-white'
                : 'text-[#666] hover:bg-[#f5f5f7] hover:text-black'
            }`}
          >
            <span>Projects</span>
            <span className="text-[11px] opacity-75 font-mono">
              {data.projects?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-left transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-black text-white'
                : 'text-[#666] hover:bg-[#f5f5f7] hover:text-black'
            }`}
          >
            <span>Profile & Bio</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-left transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-black text-white'
                : 'text-[#666] hover:bg-[#f5f5f7] hover:text-black'
            }`}
          >
            <span>The Proof (Stats)</span>
          </button>

          <button
            onClick={() => setActiveTab('experience')}
            className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-left transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'experience'
                ? 'bg-black text-white'
                : 'text-[#666] hover:bg-[#f5f5f7] hover:text-black'
            }`}
          >
            <span>Experience</span>
            <span className="text-[11px] opacity-75 font-mono">
              {data.experience?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-left transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'testimonials'
                ? 'bg-black text-white'
                : 'text-[#666] hover:bg-[#f5f5f7] hover:text-black'
            }`}
          >
            <span>Testimonials</span>
            <span className="text-[11px] opacity-75 font-mono">
              {data.testimonials?.length || 0}
            </span>
          </button>

          <div className="hidden md:block border-t border-[#f0f0f2] my-2" />

          <div className="hidden md:block text-[10.5px] uppercase tracking-[0.8px] text-[#a3a3a3] font-medium px-3 pt-2 pb-1.5">
            Integrasi Cloud
          </div>

          <button
            onClick={() => setActiveTab('cloudinary')}
            className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-left transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'cloudinary'
                ? 'bg-black text-white'
                : 'text-[#666] hover:bg-[#f5f5f7] hover:text-black'
            }`}
          >
            <span>Cloudinary</span>
          </button>

          <button
            onClick={() => setActiveTab('neon')}
            className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-left transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'neon'
                ? 'bg-black text-white'
                : 'text-[#666] hover:bg-[#f5f5f7] hover:text-black'
            }`}
          >
            <span>Neon Database</span>
          </button>
        </aside>

        {/* Content Pane - Full Width */}
        <main className="flex-1 p-6 lg:p-8 w-full min-w-0">
          {/* TAB 1: PROJECTS */}
          {activeTab === 'projects' && (
            isAddingProject || editingProject ? (
              <ProjectEditor
                project={editingProject}
                onSave={handleSaveProject}
                onCancel={() => {
                  setIsAddingProject(false);
                  setEditingProject(null);
                }}
              />
            ) : (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif font-normal text-[28px] text-[#171717]">
                      Project Portfolio
                    </h2>
                    <p className="text-[13px] text-[#737373]">
                      Kelola karya desain dan case study yang tampil di halaman Work.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProject(null);
                      setIsAddingProject(true);
                    }}
                    className="btn-dark-glow px-4 py-2 text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>+ Tambah Project</span>
                  </button>
                </div>

                {/* Projects Grid Table */}
                <div className="grid grid-cols-1 gap-4">
                  {data.projects.map((project, idx) => (
                    <div
                      key={project.id || idx}
                      className="bg-white border border-[#e5e5e7] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-[#b3b3b3]"
                    >
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-16 bg-[#e7eef0] shrink-0 border border-[#e5e5e7] overflow-hidden flex items-center justify-center">
                          {project.video ? (
                            <span className="text-[11px] font-mono font-medium text-[#555]">
                              ▶ Video
                            </span>
                          ) : project.image ? (
                            <img
                              src={project.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[11px] text-[#999]">No Media</span>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-[15px] text-[#171717]">
                              {project.title}
                            </h4>
                            <span className="text-[11px] bg-[#f0f0f2] text-[#666] px-2 py-0.5">
                              {project.span === 'tall' ? 'Tall (605px)' : 'Short (365px)'}
                            </span>
                          </div>
                          <p className="text-[12.5px] text-[#737373] mt-0.5">
                            {project.category} • {project.year}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {project.tools?.slice(0, 3).map((t, ti) => (
                              <span
                                key={ti}
                                className="text-[10.5px] text-[#888] bg-[#f7f7f8] px-1.5 py-0.5 border border-[#ececee]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setIsAddingProject(false);
                            setEditingProject(project);
                          }}
                          className="px-3 py-1.5 bg-[#f5f5f7] border border-[#e5e5e7] text-[12px] font-medium text-[#333] hover:bg-black hover:text-white transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="px-3 py-1.5 bg-white border border-[#e5e5e7] text-[12px] font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* TAB 2: PROFILE & BIO */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-serif font-normal text-[28px] text-[#171717]">
                  Profil & Informasi Kontak
                </h2>
                <p className="text-[13px] text-[#737373]">
                  Ubah data bio, nomor telepon, email, dan link sosial media.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="bg-white border border-[#e5e5e7] p-6 sm:p-8 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13.5px] text-[#171717] focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                      Headline / Title
                    </label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => setData({ ...data, title: e.target.value })}
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13.5px] text-[#171717] focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                    Bio Lengkap
                  </label>
                  <textarea
                    rows={3}
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13.5px] text-[#171717] focus:outline-none focus:border-black resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={data.phone}
                      onChange={(e) => setData({ ...data, phone: e.target.value })}
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13.5px] text-[#171717] focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13.5px] text-[#171717] focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-4 border-t border-[#f0f0f2] flex flex-col gap-3">
                  <h4 className="text-[12px] font-medium uppercase tracking-[0.5px] text-[#737373]">
                    Tautan Media Sosial
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="LinkedIn URL"
                      value={data.socials?.linkedin || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          socials: { ...data.socials, linkedin: e.target.value },
                        })
                      }
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3 py-1.5 text-[12.5px] text-[#171717] focus:outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      placeholder="X (Twitter) URL"
                      value={data.socials?.x || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          socials: { ...data.socials, x: e.target.value },
                        })
                      }
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3 py-1.5 text-[12.5px] text-[#171717] focus:outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      placeholder="Facebook URL"
                      value={data.socials?.facebook || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          socials: { ...data.socials, facebook: e.target.value },
                        })
                      }
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3 py-1.5 text-[12.5px] text-[#171717] focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="btn-dark-glow px-6 py-2 text-white text-[13px] font-medium"
                  >
                    {isSyncing ? 'Menyimpan...' : 'Simpan Perubahan Profile ke Neon'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: STATS (THE PROOF) */}
          {activeTab === 'stats' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-serif font-normal text-[28px] text-[#171717]">
                  The Proof — Metrik Angka
                </h2>
                <p className="text-[13px] text-[#737373]">
                  Edit 4 kartu metrik prestasi yang tampil di halaman About.
                </p>
              </div>

              <form onSubmit={handleSaveStats} className="bg-white border border-[#e5e5e7] p-6 sm:p-8 flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.stats.map((stat, idx) => (
                    <div key={idx} className="bg-[#f8f8fa] border border-[#e5e5e7] p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[10.5px] uppercase tracking-wider text-[#888] font-medium block mb-1">
                            Nilai
                          </label>
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => {
                              const newStats = [...data.stats];
                              newStats[idx].value = e.target.value;
                              setData({ ...data, stats: newStats });
                            }}
                            className="w-full bg-white border border-[#e5e5e7] px-3 py-1.5 text-[16px] font-bold text-[#171717]"
                          />
                        </div>
                        <div className="w-24">
                          <label className="text-[10.5px] uppercase tracking-wider text-[#888] font-medium block mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            placeholder="Yrs / %"
                            value={stat.unit || ''}
                            onChange={(e) => {
                              const newStats = [...data.stats];
                              newStats[idx].unit = e.target.value;
                              setData({ ...data, stats: newStats });
                            }}
                            className="w-full bg-white border border-[#e5e5e7] px-3 py-1.5 text-[14px] text-[#171717]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10.5px] uppercase tracking-wider text-[#888] font-medium block mb-1">
                          Label Deskripsi
                        </label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...data.stats];
                            newStats[idx].label = e.target.value;
                            setData({ ...data, stats: newStats });
                          }}
                          className="w-full bg-white border border-[#e5e5e7] px-3 py-1.5 text-[13px] text-[#555]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="btn-dark-glow px-6 py-2 text-white text-[13px] font-medium"
                  >
                    {isSyncing ? 'Menyimpan...' : 'Simpan Metrik ke Neon DB'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: EXPERIENCE */}
          {activeTab === 'experience' && (
            editingExp ? (
              <div className="w-full flex flex-col gap-6 font-sans animate-fade-in">
                {/* Header with back button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e5e5e7]">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingExp(null)}
                      className="text-[12.5px] text-[#737373] hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer w-fit mb-1 font-medium group"
                    >
                      <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                      <span>Kembali ke Daftar Experience</span>
                    </button>
                    <h2 className="font-serif font-normal text-[30px] text-[#171717] tracking-tight">
                      {editingExp.role ? `Edit: ${editingExp.role}` : 'Tambah Karir Baru'}
                    </h2>
                    <p className="text-[13px] text-[#737373]">
                      Riwayat karir dan peran profesional yang tampil di halaman About.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingExp(null)}
                      className="px-4 py-2 bg-white border border-[#e5e5e7] hover:border-black text-[13px] text-[#555] hover:text-black transition-colors cursor-pointer rounded-none"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveExperience(editingExp)}
                      className="btn-dark-glow px-6 py-2 rounded-none text-white text-[13px] font-medium cursor-pointer"
                    >
                      Simpan ke Neon DB
                    </button>
                  </div>
                </div>

                {/* Form Card */}
                <div className="bg-white border border-[#e5e5e7] p-6 sm:p-8 flex flex-col gap-6 w-full shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                        Role / Jabatan *
                      </label>
                      <input
                        type="text"
                        value={editingExp.role}
                        onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value })}
                        placeholder="Contoh: Senior Product Designer"
                        className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                        Perusahaan / Studio *
                      </label>
                      <input
                        type="text"
                        value={editingExp.company}
                        onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                        placeholder="Contoh: Gandaria Studio, Semarang"
                        className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                      Periode Karir (Contoh: Feb 2024 - Present)
                    </label>
                    <input
                      type="text"
                      value={editingExp.period}
                      onChange={(e) => setEditingExp({ ...editingExp, period: e.target.value })}
                      placeholder="Contoh: Feb 2024 - Present"
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                      Deskripsi Pekerjaan & Pencapaian
                    </label>
                    <textarea
                      rows={5}
                      value={editingExp.description}
                      onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                      placeholder="Jelaskan tanggung jawab utama, proyek yang dipimpin, dan impact yang dihasilkan..."
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-[#eeeeee]">
                    <button
                      type="button"
                      onClick={() => setEditingExp(null)}
                      className="px-4 py-2 text-[13px] text-[#737373] hover:text-black transition-colors cursor-pointer"
                    >
                      ← Batal & Kembali
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveExperience(editingExp)}
                      className="btn-dark-glow px-7 py-2.5 rounded-none text-white text-[13.5px] font-medium cursor-pointer"
                    >
                      Simpan Karir ke Neon DB →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif font-normal text-[28px] text-[#171717]">
                      Experience Timeline
                    </h2>
                    <p className="text-[13px] text-[#737373]">
                      Riwayat karier dan peran profesional di halaman About.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEditingExp({
                        id: `exp-${Date.now()}`,
                        role: '',
                        company: '',
                        period: '',
                        description: '',
                        sort: data.experience.length + 1,
                      })
                    }
                    className="btn-dark-glow px-4 py-2 text-white text-[13px] font-medium cursor-pointer"
                  >
                    + Tambah Karir
                  </button>
                </div>

                {/* Experience List */}
                <div className="flex flex-col gap-3">
                  {data.experience.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="bg-white border border-[#e5e5e7] p-5 flex flex-col md:flex-row items-start justify-between gap-4 hover:border-[#b3b3b3] transition-colors"
                    >
                      <div className="flex flex-col md:w-[240px] shrink-0">
                        <h4 className="font-medium text-[15px] text-[#171717]">
                          {exp.role}
                        </h4>
                        <span className="text-[13px] text-[#737373]">{exp.company}</span>
                        <span className="text-[12px] text-[#a3a3a3] mt-1">{exp.period}</span>
                      </div>

                      <p className="text-[13px] text-[#525252] leading-relaxed flex-1">
                        {exp.description}
                      </p>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => setEditingExp(exp)}
                          className="px-3.5 py-1.5 bg-[#f5f5f7] border border-[#e5e5e7] text-[12px] font-medium text-[#333] hover:bg-black hover:text-white cursor-pointer transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="px-3.5 py-1.5 bg-white border border-[#e5e5e7] text-[12px] font-medium text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* TAB 5: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            editingTestimonial ? (
              <div className="w-full flex flex-col gap-6 font-sans animate-fade-in">
                {/* Header with back button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e5e5e7]">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingTestimonial(null)}
                      className="text-[12.5px] text-[#737373] hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer w-fit mb-1 font-medium group"
                    >
                      <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                      <span>Kembali ke Daftar Testimonials</span>
                    </button>
                    <h2 className="font-serif font-normal text-[30px] text-[#171717] tracking-tight">
                      {editingTestimonial.name ? `Edit: ${editingTestimonial.name}` : 'Tambah Testimonial Baru'}
                    </h2>
                    <p className="text-[13px] text-[#737373]">
                      Review dan feedback dari klien yang tampil di halaman About.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingTestimonial(null)}
                      className="px-4 py-2 bg-white border border-[#e5e5e7] hover:border-black text-[13px] text-[#555] hover:text-black transition-colors cursor-pointer rounded-none"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveTestimonial(editingTestimonial)}
                      className="btn-dark-glow px-6 py-2 rounded-none text-white text-[13px] font-medium cursor-pointer"
                    >
                      Simpan ke Neon DB
                    </button>
                  </div>
                </div>

                {/* Form Card */}
                <div className="bg-white border border-[#e5e5e7] p-6 sm:p-8 flex flex-col gap-6 w-full shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                        Nama Klien *
                      </label>
                      <input
                        type="text"
                        value={editingTestimonial.name}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                        placeholder="Contoh: Sarah Jenkins"
                        className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                        Role / Jabatan Klien *
                      </label>
                      <input
                        type="text"
                        value={editingTestimonial.role}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                        placeholder="Contoh: VP of Product, FinTech Corp"
                        className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                      Rating Bintang
                    </label>
                    <select
                      value={editingTestimonial.rating || 5}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: Number(e.target.value) })}
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
                    >
                      <option value={5}>★★★★★ (5 Bintang)</option>
                      <option value={4}>★★★★☆ (4 Bintang)</option>
                      <option value={3}>★★★☆☆ (3 Bintang)</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5">
                      Isi Testimonial / Review
                    </label>
                    <textarea
                      rows={5}
                      value={editingTestimonial.content}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                      placeholder="Tulis ulasan klien di sini..."
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-[#eeeeee]">
                    <button
                      type="button"
                      onClick={() => setEditingTestimonial(null)}
                      className="px-4 py-2 text-[13px] text-[#737373] hover:text-black transition-colors cursor-pointer"
                    >
                      ← Batal & Kembali
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveTestimonial(editingTestimonial)}
                      className="btn-dark-glow px-7 py-2.5 rounded-none text-white text-[13.5px] font-medium cursor-pointer"
                    >
                      Simpan Testimonial ke Neon DB →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif font-normal text-[28px] text-[#171717]">
                      Client Testimonials
                    </h2>
                    <p className="text-[13px] text-[#737373]">
                      Review dan feedback dari klien di halaman About.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEditingTestimonial({
                        id: `test-${Date.now()}`,
                        name: '',
                        role: '',
                        content: '',
                        rating: 5,
                        sort: data.testimonials.length + 1,
                      })
                    }
                    className="btn-dark-glow px-4 py-2 text-white text-[13px] font-medium cursor-pointer"
                  >
                    + Tambah Review
                  </button>
                </div>

                {/* Testimonials List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.testimonials.map((test, idx) => (
                    <div
                      key={test.id || idx}
                      className="bg-white border border-[#e5e5e7] p-5 flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-[15px] text-[#171717]">{test.name}</h4>
                            <p className="text-[12px] text-[#737373]">{test.role}</p>
                          </div>
                          <span className="text-[#171717] text-[13px] tracking-wider font-mono">
                            {'★'.repeat(test.rating || 5)}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#525252] leading-relaxed mt-3 italic">
                          "{test.content}"
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f0f2]">
                        <button
                          onClick={() => setEditingTestimonial(test)}
                          className="px-3.5 py-1.5 bg-[#f5f5f7] border border-[#e5e5e7] text-[12px] font-medium text-[#333] hover:bg-black hover:text-white cursor-pointer transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(test.id)}
                          className="px-3.5 py-1.5 bg-white border border-[#e5e5e7] text-[12px] font-medium text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* TAB 6: CLOUDINARY CONFIGURATION */}
          {activeTab === 'cloudinary' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-serif font-normal text-[28px] text-[#171717]">
                  Pengaturan Cloudinary (Media Storage)
                </h2>
                <p className="text-[13px] text-[#737373]">
                  Hubungkan akun Cloudinary gratis Anda untuk upload gambar & video tanpa batas.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSaveCloudinary} className="lg:col-span-2 bg-white border border-[#e5e5e7] p-6 flex flex-col gap-4">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                      Cloud Name *
                    </label>
                    <input
                      type="text"
                      placeholder="contoh: donny-cloud"
                      value={cloudinaryConfig.cloudName || ''}
                      onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, cloudName: e.target.value.trim() })}
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13px] text-[#171717] focus:outline-none focus:border-black"
                    />
                    <span className="text-[11px] text-[#888] mt-1">
                      Bisa ditemukan di dashboard utama Cloudinary Anda.
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                      Upload Preset (Unsigned) *
                    </label>
                    <input
                      type="text"
                      placeholder="contoh: portfolio_preset"
                      value={cloudinaryConfig.uploadPreset || ''}
                      onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, uploadPreset: e.target.value.trim() })}
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13px] text-[#171717] focus:outline-none focus:border-black"
                    />
                    <span className="text-[11px] text-[#888] mt-1">
                      Dibuat di Cloudinary: Settings → Upload → Upload Presets → Add upload preset (Signing Mode: Unsigned).
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1">
                      Folder Tujuan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="portfolio"
                      value={cloudinaryConfig.folder || 'portfolio'}
                      onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, folder: e.target.value.trim() })}
                      className="bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2 text-[13px] text-[#171717] focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="btn-dark-glow px-6 py-2 text-white text-[13px] font-medium"
                    >
                      Simpan Konfigurasi Cloudinary
                    </button>
                  </div>
                </form>

                {/* Instructions Box */}
                <div className="bg-[#f5f5f7] border border-[#e5e5e7] p-5 flex flex-col gap-3 text-[12px] text-[#525252] leading-relaxed">
                  <h4 className="font-semibold text-[13px] text-[#171717]">
                    💡 Panduan Singkat Cloudinary (1 Menit):
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11.5px]">
                    <li>Daftar/login di <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="text-black font-semibold underline">cloudinary.com</a> (Gratis).</li>
                    <li>Salin <strong>Cloud Name</strong> yang ada di dashboard utama.</li>
                    <li>Buka <strong>Settings (ikon gear)</strong> → tab <strong>Upload</strong>.</li>
                    <li>Scroll ke bagian <strong>Upload Presets</strong>, klik <strong>Add Upload Preset</strong>.</li>
                    <li>Ubah <strong>Signing Mode</strong> dari Signed menjadi <strong>Unsigned</strong>.</li>
                    <li>Klik <strong>Save</strong> dan salin nama preset ke form di sebelah kiri.</li>
                  </ol>
                  <p className="text-[11px] text-[#888] border-t border-[#e5e5e7] pt-2">
                    Setelah disimpan, saat menambahkan atau mengedit Project Anda bisa langsung mengunggah file gambar maupun video!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: NEON DATABASE STATUS */}
          {activeTab === 'neon' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-serif font-normal text-[28px] text-[#171717]">
                  Neon PostgreSQL Database
                </h2>
                <p className="text-[13px] text-[#737373]">
                  Status koneksi database serverless dan ringkasan tabel aktif.
                </p>
              </div>

              <div className="bg-white border border-[#e5e5e7] p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f2]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <span className="text-[14px] font-medium text-[#171717]">
                        Neon DB Status: Online & Terhubung
                      </span>
                      <p className="text-[11.5px] text-[#737373]">
                        Serverless PostgreSQL 18 di AWS us-east-2
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      setIsSyncing(true);
                      try {
                        const fresh = await fetchPortfolioFromNeon();
                        if (fresh) {
                          setData(fresh);
                          onUpdatePortfolio(fresh);
                          notify('Data terbaru berhasil diambil dari Neon DB!');
                        }
                      } finally {
                        setIsSyncing(false);
                      }
                    }}
                    className="px-4 py-1.5 bg-[#f5f5f7] border border-[#e5e5e7] text-[12px] font-medium text-[#333] hover:bg-black hover:text-white"
                  >
                    {isSyncing ? 'Memuat...' : '↻ Refresh dari Neon'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                  <div className="bg-[#f8f8fa] p-3 border border-[#ececee]">
                    <span className="text-[11px] text-[#888] uppercase block">Tabel Projects</span>
                    <span className="text-[20px] font-bold text-[#171717]">{data.projects?.length || 0}</span>
                  </div>
                  <div className="bg-[#f8f8fa] p-3 border border-[#ececee]">
                    <span className="text-[11px] text-[#888] uppercase block">Tabel Experience</span>
                    <span className="text-[20px] font-bold text-[#171717]">{data.experience?.length || 0}</span>
                  </div>
                  <div className="bg-[#f8f8fa] p-3 border border-[#ececee]">
                    <span className="text-[11px] text-[#888] uppercase block">Tabel Testimonials</span>
                    <span className="text-[20px] font-bold text-[#171717]">{data.testimonials?.length || 0}</span>
                  </div>
                  <div className="bg-[#f8f8fa] p-3 border border-[#ececee]">
                    <span className="text-[11px] text-[#888] uppercase block">Site Settings</span>
                    <span className="text-[20px] font-bold text-[#171717]">4 keys</span>
                  </div>
                </div>

                <div className="p-3 bg-[#f5f5f7] border border-[#e5e5e7] text-[11.5px] font-mono text-[#555] break-all">
                  Connection: postgresql://neondb_owner:***@ep-autumn-snow-b5xiqct7-pooler.c-7.us-east-2.aws.neon.tech/neondb
                </div>
              </div>
            </div>
          )}
        </main>
      </div>


      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171717] text-white px-5 py-3 rounded-none text-[13px] font-sans shadow-2xl flex items-center gap-2 border border-white/10 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

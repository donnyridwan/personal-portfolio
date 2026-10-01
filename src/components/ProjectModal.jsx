import React from 'react';

export default function ProjectModal({ project, onClose, onBookCall }) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-[16px] max-w-[650px] w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-black transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] uppercase font-semibold text-[#8a857d] tracking-wider">
              {project.category} • {project.year}
            </span>
            <h2 className="text-[24px] font-serif text-black leading-snug">
              {project.title}
            </h2>
          </div>

          <div className="w-full h-[280px] rounded-[8px] overflow-hidden bg-[#e7eef0] relative">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h4 className="text-[14px] font-medium text-black mb-1">Overview & Challenge</h4>
              <p className="text-[14px] text-[#6b665e] leading-relaxed font-light">
                {project.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-neutral-100">
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wide block">Role</span>
                <span className="text-sm font-medium text-black">{project.role}</span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wide block">Year</span>
                <span className="text-sm font-medium text-black">{project.year}</span>
              </div>
            </div>

            <div>
              <h4 className="text-[14px] font-medium text-black mb-2">Tools & Competencies</h4>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool, i) => (
                  <span
                    key={i}
                    className="bg-[#f5f4f0] text-neutral-700 text-xs px-2.5 py-1 rounded"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <button
              onClick={onClose}
              className="text-sm text-neutral-500 hover:text-black"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookCall();
              }}
              className="btn-dark-glow px-4 py-2 rounded-[6px] text-white text-xs font-medium"
            >
              Discuss Similar Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

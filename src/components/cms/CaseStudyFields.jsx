import React, { useState } from 'react';

const labelClass = 'text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5';
const inputClass =
  'bg-[#f8f8fa] border border-[#e5e5e7] px-3.5 py-2.5 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none';

function FieldError({ children }) {
  if (!children) return null;
  return <span className="text-[12px] text-red-600 mt-1.5">{children}</span>;
}

export default function CaseStudyFields({ value, onChange, slugError, liveUrlError }) {
  return (
    <div className="flex flex-col gap-5">
      <SlugSetting slug={value.slug} onChange={(slug) => onChange({ slug })} error={slugError} />

      <div className="flex flex-col gap-5">
        <div className="flex flex-col">
          <label className={labelClass}>Client</label>
          <input
            type="text"
            value={value.client}
            onChange={(e) => onChange({ client: e.target.value })}
            placeholder="Contoh: Harvasta Cottages"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Link Live Site</label>
          <input
            type="url"
            value={value.liveUrl}
            onChange={(e) => onChange({ liveUrl: e.target.value })}
            placeholder="https://..."
            className={`${inputClass} ${liveUrlError ? 'border-red-400' : ''}`}
          />
          <FieldError>{liveUrlError}</FieldError>
        </div>
      </div>

      <div className="flex flex-col">
        <label className={labelClass}>Ringkasan Satu Kalimat</label>
        <input
          type="text"
          value={value.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="Contoh: Website booking untuk cottage mewah di pegunungan."
          className={inputClass}
        />
      </div>
    </div>
  );
}

// Slug is usually auto-derived from the title, so it stays folded unless the author opens it
// or it has an error that needs fixing
function SlugSetting({ slug, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = isOpen || Boolean(error);

  return (
    <div className={`border ${error ? 'border-red-300 bg-red-50/40' : 'border-[#e5e5e7] bg-[#fafafa]'} px-3.5 py-2.5 flex flex-col gap-2`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.5px] text-[#737373]">Pengaturan URL</span>
          <span className="text-[12.5px] text-[#171717] font-mono truncate">/work/{slug || '…'}</span>
        </div>
        {!error && (
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={open}
            className="text-[12px] text-[#171717] underline underline-offset-4 decoration-1 hover:opacity-70 shrink-0 cursor-pointer"
          >
            {open ? 'Tutup' : 'Ubah'}
          </button>
        )}
      </div>
      {open && (
        <div className="flex flex-col">
          <div className="flex items-stretch">
            <span className="bg-[#efeeec] border border-r-0 border-[#e5e5e7] px-3 flex items-center text-[13px] text-[#737373] font-mono">
              /work/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => onChange(e.target.value)}
              placeholder="harvasta"
              aria-label="Slug URL halaman"
              className={`${inputClass} flex-1 min-w-0 font-mono ${error ? 'border-red-400' : ''}`}
            />
          </div>
          <FieldError>{error}</FieldError>
        </div>
      )}
    </div>
  );
}

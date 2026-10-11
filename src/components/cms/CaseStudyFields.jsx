import React from 'react';

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
      <div className="flex flex-col">
        <label className={labelClass}>Slug (URL halaman) *</label>
        <div className="flex items-stretch">
          <span className="bg-[#efeeec] border border-r-0 border-[#e5e5e7] px-3 flex items-center text-[13px] text-[#737373] font-mono">
            /work/
          </span>
          <input
            type="text"
            value={value.slug}
            onChange={(e) => onChange({ slug: e.target.value })}
            placeholder="harvasta"
            className={`${inputClass} flex-1 min-w-0 font-mono ${slugError ? 'border-red-400' : ''}`}
          />
        </div>
        <FieldError>{slugError}</FieldError>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

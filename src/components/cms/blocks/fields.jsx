import React from 'react';

export const labelClass = 'text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373] mb-1.5';
export const inputClass =
  'bg-white border border-[#e5e5e7] px-3 py-2 text-[13.5px] text-[#171717] focus:outline-none focus:border-black rounded-none w-full';

export function Field({ label, children }) {
  return (
    <label className="flex flex-col min-w-0">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ label, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
    </Field>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <Field label={label}>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} resize-y leading-relaxed`}
      />
    </Field>
  );
}

import React from 'react';

export default function TextBlock({ label, heading, body }) {
  return (
    <section className="flex flex-col gap-3 max-w-[720px]">
      {label && (
        <span className="text-[11px] font-medium tracking-[0.66px] uppercase text-[#a3a3a3]">{label}</span>
      )}
      {heading && (
        <h2 className="font-serif font-normal text-[28px] md:text-[32px] leading-[1.15] tracking-[-0.64px] text-[#171717]">
          {heading}
        </h2>
      )}
      {body && (
        <p className="font-light text-[15px] leading-[26px] tracking-[-0.2px] text-[#525252] whitespace-pre-line">
          {body}
        </p>
      )}
    </section>
  );
}

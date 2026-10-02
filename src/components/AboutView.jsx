import React from 'react';
import { portfolioData } from '../data/portfolioData';

export default function AboutView({ onBookCall, onOpenContact }) {
  return (
    <div className="flex-1 w-full pb-24 font-sans animate-fade-in">
      {/* 1. Hero Header */}
      <section className="flex flex-col items-center text-center pt-4 pb-12">
        <span className="text-[11px] font-medium tracking-[0.66px] uppercase text-[#a3a3a3] font-sans">
          About Me
        </span>
        <h1 className="font-serif font-normal text-[38px] sm:text-[52px] leading-[1.12] text-[#171717] tracking-[-0.64px] max-w-2xl mx-auto mt-3">
          I design products people <br className="hidden sm:inline" /> can actually finish using.
        </h1>
        <p className="font-sans font-light text-[14px] sm:text-[15px] leading-[22px] tracking-[-0.3px] text-[#737373] max-w-xl mx-auto mt-4">
          {portfolioData.bio}
        </p>
        <div className="flex justify-center mt-7">
          <button
            onClick={onBookCall}
            className="btn-dark-glow h-[38px] px-[16px] py-[8px] rounded-none flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span className="font-sans font-medium text-[14px] text-white tracking-[-0.28px] whitespace-nowrap leading-none">
              Book a Call
            </span>
            <img
              src="./assets/call-icon.png"
              alt="Call"
              className="w-[17px] h-[14px] object-contain"
            />
          </button>
        </div>
      </section>

      {/* 2. Testimonials (3 Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
        {portfolioData.testimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-[#f5f5f7] border border-[#e5e5e7] rounded-none p-6 sm:p-7 flex flex-col justify-between transition-colors duration-300 hover:border-[#b3b3b3]"
          >
            <div>
              <h4 className="font-sans font-medium text-[15px] tracking-[-0.3px] text-[#171717]">
                {t.name}
              </h4>
              <p className="font-sans font-light text-[12px] tracking-[-0.24px] text-[#737373] mt-0.5">
                {t.role}
              </p>
              <div className="flex text-[#171717] text-[11px] gap-1 mt-3 tracking-widest">
                {'★'.repeat(t.rating)}
              </div>
            </div>
            <p className="font-sans font-light text-[13px] leading-[21px] tracking-[-0.2px] text-[#525252] mt-6">
              "{t.content}"
            </p>
          </div>
        ))}
      </section>

      {/* 3. The Proof ("Numbers that hold up.") */}
      <section className="mt-20 pt-16 border-t border-[#eeeeee] flex flex-col items-center w-full">
        <span className="text-[11px] font-medium tracking-[0.66px] uppercase text-[#a3a3a3] font-sans">
          The Proof
        </span>
        <h2 className="font-serif font-normal text-[32px] sm:text-[40px] text-[#171717] tracking-[-0.64px] text-center mt-2">
          Numbers that hold up.
        </h2>
        <p className="font-sans font-light text-[13px] tracking-[-0.24px] text-[#737373] text-center mt-1">
          Delivering measurable impact across every project.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mt-8">
          {portfolioData.stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#f5f5f7] border border-[#e5e5e7] rounded-none p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-colors duration-300 hover:border-[#b3b3b3]"
            >
              <div className="font-serif font-normal text-[52px] sm:text-[64px] text-[#171717] leading-none tracking-tight flex items-baseline justify-center gap-1.5">
                <span>{stat.value}</span>
                {stat.unit && (
                  <span className="font-sans text-[20px] font-light text-[#737373]">{stat.unit}</span>
                )}
              </div>
              <span className="font-sans font-light text-[13.5px] tracking-[-0.2px] text-[#525252] mt-3">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Experience ("From first brief to final handoff.") */}
      <section className="mt-20 pt-16 border-t border-[#eeeeee] flex flex-col items-center w-full">
        <span className="text-[11px] font-medium tracking-[0.66px] uppercase text-[#a3a3a3] font-sans">
          Experience
        </span>
        <h2 className="font-serif font-normal text-[32px] sm:text-[40px] text-[#171717] tracking-[-0.64px] text-center mt-2">
          From first brief to final handoff.
        </h2>
        <p className="font-sans font-light text-[13px] tracking-[-0.24px] text-[#737373] text-center mt-1">
          4+ years of building products from zero to one.
        </p>

        <div className="flex flex-col gap-4 w-full mt-8">
          {portfolioData.experience.map((exp, idx) => (
            <div
              key={idx}
              className="bg-[#f5f5f7] border border-[#e5e5e7] rounded-none p-6 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6 transition-colors duration-300 hover:border-[#b3b3b3]"
            >
              <div className="flex flex-col md:w-[260px] shrink-0">
                <h4 className="font-sans font-medium text-[15px] tracking-[-0.3px] text-[#171717]">
                  {exp.role}
                </h4>
                <span className="font-sans font-light text-[13px] text-[#737373] mt-0.5">
                  {exp.company}
                </span>
                <span className="font-sans font-light text-[12px] text-[#a3a3a3] mt-1.5">
                  {exp.period}
                </span>
              </div>
              <p className="font-sans font-light text-[13.5px] leading-[22px] tracking-[-0.2px] text-[#525252] flex-1">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Get in Touch Section */}
      <section className="mt-20 pt-16 border-t border-[#eeeeee] w-full flex flex-col items-center">
        <div className="w-full bg-[#f5f5f7] border border-[#e5e5e7] rounded-none p-10 sm:p-14 text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium tracking-[0.66px] uppercase text-[#a3a3a3] font-sans">
            Contact
          </span>
          <h3 className="font-serif font-normal text-[36px] sm:text-[44px] text-[#171717] tracking-[-0.64px] mt-2">
            Get in Touch
          </h3>
          <p className="font-sans font-light text-[13.5px] text-[#737373] mt-1">
            Have a project in mind? Let's talk.
          </p>

          <div className="mt-9 flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.66px] text-[#a3a3a3] font-sans">
              DIRECT CONTACT
            </span>
            <a
              href={`tel:${portfolioData.phone.replace(/\s+/g, '')}`}
              className="font-sans font-normal text-[18px] sm:text-[20px] text-[#171717] hover:opacity-75 transition-opacity mt-1 tracking-tight"
            >
              {portfolioData.phone}
            </a>
            <a
              href={`mailto:${portfolioData.email}`}
              className="font-serif font-normal text-[26px] sm:text-[32px] text-[#171717] hover:underline underline-offset-4 decoration-1 transition-all mt-0.5 tracking-tight"
            >
              {portfolioData.email}
            </a>
          </div>

          {/* Social and Contact Icons */}
          <div className="flex items-center justify-center gap-3 mt-7">
            <a
              href={portfolioData.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-white border border-[#e5e5e7] rounded-none flex items-center justify-center hover:bg-[#ededf0] transition-colors"
              title="LinkedIn Profile"
            >
              <svg className="w-4 h-4 fill-[#171717]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>
            <a
              href={`mailto:${portfolioData.email}`}
              className="w-11 h-11 bg-white border border-[#e5e5e7] rounded-none flex items-center justify-center hover:bg-[#ededf0] transition-colors"
              title="Send Email"
            >
              <svg className="w-4 h-4 fill-none stroke-[#171717]" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect width="20" height="16" x="2" y="4" rx="1" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
            <a
              href={`tel:${portfolioData.phone.replace(/\s+/g, '')}`}
              className="w-11 h-11 bg-white border border-[#e5e5e7] rounded-none flex items-center justify-center hover:bg-[#ededf0] transition-colors"
              title="Call Phone"
            >
              <svg className="w-4 h-4 fill-none stroke-[#171717]" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
          </div>

          <button
            onClick={onBookCall}
            className="mt-8 btn-dark-glow h-[38px] px-[18px] py-[8px] rounded-none flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span className="font-sans font-medium text-[14px] text-white tracking-[-0.28px] whitespace-nowrap leading-none">
              Book a Call
            </span>
            <img
              src="./assets/call-icon.png"
              alt="Call"
              className="w-[17px] h-[14px] object-contain"
            />
          </button>
        </div>

        {/* Footer copyright matching style */}
        <p className="font-sans font-light text-[12px] text-[#a3a3a3] text-center mt-8">
          © Copyright Donny Ridwan. All rights reserved.
        </p>
      </section>
    </div>
  );
}

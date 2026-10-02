import React from 'react';
import { portfolioData } from '../data/portfolioData';

export default function AboutView({ onBookCall, onOpenContact }) {
  return (
    <div className="flex-1 max-w-[860px] w-full mx-auto pb-24 font-sans animate-fade-in">
      {/* 1. Hero Header */}
      <section className="flex flex-col items-center text-center pt-2 pb-6">
        <span className="text-[12px] font-medium text-[#555] bg-[#efeeea] border border-[#e5e3de] px-3.5 py-1 rounded-full">
          About Me
        </span>
        <h1 className="text-[36px] sm:text-[46px] font-sans font-semibold leading-[1.12] text-[#111] tracking-[-0.03em] max-w-xl mx-auto mt-4">
          I design products people <br className="hidden sm:inline" />
          can actually <span className="font-bold">finish using.</span>
        </h1>
        <p className="text-[14.5px] sm:text-[15.5px] text-[#666] font-normal leading-relaxed max-w-lg mx-auto mt-3.5">
          {portfolioData.bio}
        </p>
        <div className="flex justify-center mt-6">
          <button
            onClick={onBookCall}
            className="btn-dark-glow px-6 py-2.5 rounded-full text-white text-[14px] font-medium shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Book a Call</span>
            <svg
              className="w-3.5 h-3.5 fill-none stroke-current text-white/90"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>

      {/* 2. Testimonials (3 Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8">
        {portfolioData.testimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-[#f7f6f4] border border-[#ebe9e4] rounded-[20px] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:bg-white hover:border-[#dedede] hover:shadow-sm"
          >
            <div>
              <h4 className="text-[14.5px] font-semibold text-[#111]">{t.name}</h4>
              <p className="text-[12px] text-[#777] font-normal">{t.role}</p>
              <div className="flex text-[#181818] text-[12px] gap-0.5 mt-2 tracking-wider">
                {'★'.repeat(t.rating)}
              </div>
            </div>
            <p className="text-[13px] text-[#555] font-normal leading-relaxed mt-4">
              "{t.content}"
            </p>
          </div>
        ))}
      </section>

      {/* 3. The Proof ("Numbers that hold up.") */}
      <section className="mt-20 flex flex-col items-center w-full">
        <span className="text-[11px] uppercase tracking-wider bg-[#181818] text-white px-3.5 py-1 rounded-full font-medium">
          The Proof
        </span>
        <h2 className="text-[28px] sm:text-[34px] font-sans font-semibold text-[#111] text-center mt-3 tracking-tight">
          Numbers that hold up.
        </h2>
        <p className="text-[13.5px] text-[#777] font-normal text-center mt-1">
          Delivering measurable impact across every project.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
          {portfolioData.stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#f7f6f4] border border-[#ebe9e4] rounded-[20px] p-8 text-center flex flex-col items-center justify-center transition-all duration-300 hover:bg-white hover:border-[#dedede] hover:shadow-sm"
            >
              <div className="text-[44px] sm:text-[50px] font-sans font-bold text-[#111] tracking-tight leading-none flex items-baseline justify-center gap-1.5">
                <span>{stat.value}</span>
                {stat.unit && (
                  <span className="text-[19px] font-semibold text-[#777]">{stat.unit}</span>
                )}
              </div>
              <span className="text-[13.5px] font-medium text-[#333] mt-2.5 max-w-[200px] leading-snug">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Experience ("From first brief to final handoff.") */}
      <section className="mt-20 pt-16 border-t border-[#ebe9e4] flex flex-col items-center w-full">
        <span className="text-[11px] uppercase tracking-wider bg-[#181818] text-white px-3.5 py-1 rounded-full font-medium">
          Experience
        </span>
        <h2 className="text-[28px] sm:text-[34px] font-sans font-semibold text-[#111] text-center mt-3 tracking-tight">
          From first brief to final handoff.
        </h2>
        <p className="text-[13.5px] text-[#777] font-normal text-center mt-1">
          4+ years of building products from zero to one.
        </p>

        <div className="flex flex-col gap-3.5 w-full mt-8">
          {portfolioData.experience.map((exp, idx) => (
            <div
              key={idx}
              className="bg-[#f7f6f4] border border-[#ebe9e4] rounded-[18px] p-5 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-5 transition-all duration-300 hover:bg-white hover:border-[#dedede] hover:shadow-sm"
            >
              <div className="flex flex-col md:w-[220px] shrink-0">
                <h4 className="text-[15px] font-semibold text-[#111]">{exp.role}</h4>
                <span className="text-[13px] text-[#666] font-normal">{exp.company}</span>
                <span className="text-[12px] text-[#999] font-normal mt-1">{exp.period}</span>
              </div>
              <p className="text-[13.5px] text-[#555] font-normal leading-relaxed flex-1">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Get in Touch Section */}
      <section className="mt-20 w-full flex flex-col items-center">
        <div className="w-full bg-[#f7f6f4] border border-[#ebe9e4] rounded-[24px] p-8 sm:p-12 text-center flex flex-col items-center justify-center relative shadow-sm">
          <span className="text-[11px] uppercase tracking-wider bg-[#181818] text-white px-3.5 py-1 rounded-full font-medium">
            Contact
          </span>
          <h3 className="text-[30px] sm:text-[36px] font-sans font-semibold text-[#111] mt-3 tracking-tight">
            Get in Touch
          </h3>
          <p className="text-[14px] text-[#777] font-normal mt-1">
            Have a project in mind? Let's talk.
          </p>

          <div className="mt-8 flex flex-col items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#999] font-semibold">
              DIRECT CONTACT
            </span>
            <a
              href={`tel:${portfolioData.phone.replace(/\s+/g, '')}`}
              className="text-[18px] sm:text-[20px] font-sans font-medium text-[#222] hover:opacity-75 transition-opacity"
            >
              {portfolioData.phone}
            </a>
            <a
              href={`mailto:${portfolioData.email}`}
              className="text-[22px] sm:text-[26px] font-sans font-semibold text-[#111] hover:underline underline-offset-4 decoration-1 transition-all"
            >
              {portfolioData.email}
            </a>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <a
              href={portfolioData.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white border border-[#dedede] rounded-full flex items-center justify-center hover:bg-neutral-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
              title="LinkedIn Profile"
            >
              <svg className="w-4 h-4 fill-current text-[#1e1e1e]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>
            <a
              href={`mailto:${portfolioData.email}`}
              className="w-10 h-10 bg-white border border-[#dedede] rounded-full flex items-center justify-center hover:bg-neutral-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
              title="Send Email"
            >
              <svg className="w-4 h-4 fill-none stroke-current text-[#1e1e1e]" strokeWidth="1.9" viewBox="0 0 24 24">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
            <a
              href={`tel:${portfolioData.phone.replace(/\s+/g, '')}`}
              className="w-10 h-10 bg-white border border-[#dedede] rounded-full flex items-center justify-center hover:bg-neutral-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
              title="Call Phone"
            >
              <svg className="w-4 h-4 fill-none stroke-current text-[#1e1e1e]" strokeWidth="1.9" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
          </div>

          <button
            onClick={onBookCall}
            className="mt-7 btn-dark-glow px-6 py-2.5 rounded-full text-white text-[13.5px] font-medium shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Book a Call</span>
            <svg
              className="w-3.5 h-3.5 fill-none stroke-current text-white/90"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Copyright notice matching mockup */}
        <p className="text-[12px] text-[#888] font-normal text-center mt-6">
          © Copyright Donny Ridwan. All rights reserved.
        </p>
      </section>
    </div>
  );
}

import React from 'react';
import { portfolioData } from '../data/portfolioData';

export default function AboutView({ onBookCall, onOpenContact }) {
  return (
    <div className="flex-1 w-full max-w-[1000px] mx-auto pb-24 font-sans animate-fade-in">
      {/* 1. Hero Header */}
      <section className="flex flex-col items-center text-center pt-4 pb-12">
        <span className="text-[11px] font-medium tracking-[0.66px] uppercase text-[#b7b2aa] font-sans">
          About Me
        </span>
        <h1 className="font-serif font-normal text-[38px] sm:text-[50px] leading-[1.14] text-[#1e1e1e] tracking-[-0.64px] max-w-2xl mx-auto mt-3">
          I design products people <br className="hidden sm:inline" /> can actually finish using.
        </h1>
        <p className="font-sans font-light text-[14px] sm:text-[15px] leading-[22px] tracking-[-0.3px] text-[#8a857d] max-w-xl mx-auto mt-4">
          {portfolioData.bio}
        </p>
        <div className="flex justify-center mt-7">
          <button
            onClick={onBookCall}
            className="btn-dark-glow h-[42px] px-7 rounded-none flex items-center justify-center gap-2.5 group cursor-pointer"
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
            className="bg-[#fbf9f6] border border-[#ede9e2] rounded-none p-6 flex flex-col justify-between transition-colors duration-300 hover:border-[#b7b2aa]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans font-medium text-[15px] tracking-[-0.3px] text-[#1e1e1e]">
                    {t.name}
                  </h4>
                  <p className="font-sans font-light text-[12px] tracking-[-0.24px] text-[#8a857d] mt-0.5">
                    {t.role}
                  </p>
                </div>
              </div>
              <div className="flex text-[#1e1e1e] text-[11px] gap-1 mt-3 tracking-widest">
                {'★'.repeat(t.rating)}
              </div>
            </div>
            <p className="font-sans font-light text-[13px] leading-[21px] tracking-[-0.2px] text-[#6b665e] mt-5">
              "{t.content}"
            </p>
          </div>
        ))}
      </section>

      {/* 3. The Proof ("Numbers that hold up.") */}
      <section className="mt-20 pt-16 border-t border-[#f1eee9] flex flex-col items-center w-full">
        <span className="text-[11px] font-medium tracking-[0.66px] uppercase text-[#b7b2aa] font-sans">
          The Proof
        </span>
        <h2 className="font-serif font-normal text-[32px] sm:text-[40px] text-[#1e1e1e] tracking-[-0.64px] text-center mt-2">
          Numbers that hold up.
        </h2>
        <p className="font-sans font-light text-[13px] tracking-[-0.24px] text-[#8a857d] text-center mt-1">
          Delivering measurable impact across every project.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mt-8">
          {portfolioData.stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#fbf9f6] border border-[#ede9e2] rounded-none p-8 sm:p-10 text-center flex flex-col items-center justify-center transition-colors duration-300 hover:border-[#b7b2aa]"
            >
              <div className="font-serif font-normal text-[52px] sm:text-[62px] text-[#1e1e1e] leading-none tracking-tight flex items-baseline justify-center gap-1.5">
                <span>{stat.value}</span>
                {stat.unit && (
                  <span className="font-sans text-[20px] font-light text-[#8a857d]">{stat.unit}</span>
                )}
              </div>
              <span className="font-sans font-light text-[13.5px] tracking-[-0.2px] text-[#6b665e] mt-3">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Experience ("From first brief to final handoff.") */}
      <section className="mt-20 pt-16 border-t border-[#f1eee9] flex flex-col items-center w-full">
        <span className="text-[11px] font-medium tracking-[0.66px] uppercase text-[#b7b2aa] font-sans">
          Experience
        </span>
        <h2 className="font-serif font-normal text-[32px] sm:text-[40px] text-[#1e1e1e] tracking-[-0.64px] text-center mt-2">
          From first brief to final handoff.
        </h2>
        <p className="font-sans font-light text-[13px] tracking-[-0.24px] text-[#8a857d] text-center mt-1">
          4+ years of building products from zero to one.
        </p>

        <div className="flex flex-col gap-4 w-full mt-8">
          {portfolioData.experience.map((exp, idx) => (
            <div
              key={idx}
              className="bg-[#fbf9f6] border border-[#ede9e2] rounded-none p-6 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6 transition-colors duration-300 hover:border-[#b7b2aa]"
            >
              <div className="flex flex-col md:w-[240px] shrink-0">
                <h4 className="font-sans font-medium text-[15px] tracking-[-0.3px] text-[#1e1e1e]">
                  {exp.role}
                </h4>
                <span className="font-sans font-light text-[13px] text-[#8a857d] mt-0.5">
                  {exp.company}
                </span>
                <span className="font-sans font-light text-[12px] text-[#b7b2aa] mt-1.5">
                  {exp.period}
                </span>
              </div>
              <p className="font-sans font-light text-[13.5px] leading-[22px] tracking-[-0.2px] text-[#6b665e] flex-1">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Get in Touch Section */}
      <section className="mt-20 pt-16 border-t border-[#f1eee9] w-full flex flex-col items-center">
        <div className="w-full bg-[#fbf9f6] border border-[#ede9e2] rounded-none p-10 sm:p-14 text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium tracking-[0.66px] uppercase text-[#b7b2aa] font-sans">
            Contact
          </span>
          <h3 className="font-serif font-normal text-[36px] sm:text-[44px] text-[#1e1e1e] tracking-[-0.64px] mt-2">
            Get in Touch
          </h3>
          <p className="font-sans font-light text-[13.5px] text-[#8a857d] mt-1">
            Have a project in mind? Let's talk.
          </p>

          <div className="mt-9 flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.66px] text-[#b7b2aa] font-sans">
              DIRECT CONTACT
            </span>
            <a
              href={`tel:${portfolioData.phone.replace(/\s+/g, '')}`}
              className="font-sans font-normal text-[18px] sm:text-[20px] text-[#1e1e1e] hover:opacity-75 transition-opacity mt-1 tracking-tight"
            >
              {portfolioData.phone}
            </a>
            <a
              href={`mailto:${portfolioData.email}`}
              className="font-serif font-normal text-[26px] sm:text-[32px] text-[#1e1e1e] hover:underline underline-offset-4 decoration-1 transition-all mt-0.5 tracking-tight"
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
              className="w-11 h-11 bg-white border border-[#ede9e2] rounded-none flex items-center justify-center hover:bg-[#f5f3ef] transition-colors"
              title="LinkedIn Profile"
            >
              <img src="./assets/linkedin.svg" alt="LinkedIn" className="w-5 h-5 opacity-80 hover:opacity-100" />
            </a>
            <a
              href={`mailto:${portfolioData.email}`}
              className="w-11 h-11 bg-white border border-[#ede9e2] rounded-none flex items-center justify-center hover:bg-[#f5f3ef] transition-colors"
              title="Send Email"
            >
              <img src="./assets/envelope.svg" alt="Email" className="w-5 h-5 opacity-80 hover:opacity-100" />
            </a>
            <a
              href={`tel:${portfolioData.phone.replace(/\s+/g, '')}`}
              className="w-11 h-11 bg-white border border-[#ede9e2] rounded-none flex items-center justify-center hover:bg-[#f5f3ef] transition-colors"
              title="Call Phone"
            >
              <img src="./assets/call-icon.png" alt="Phone" className="w-4 h-3.5 object-contain opacity-80 hover:opacity-100" />
            </a>
          </div>

          <button
            onClick={onBookCall}
            className="mt-8 btn-dark-glow h-[42px] px-7 rounded-none flex items-center justify-center gap-2.5 group cursor-pointer"
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
        <p className="font-sans font-light text-[12px] text-[#b7b2aa] text-center mt-8">
          © Copyright Donny Ridwan. All rights reserved.
        </p>
      </section>
    </div>
  );
}

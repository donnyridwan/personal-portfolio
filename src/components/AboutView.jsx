import React from 'react';
import { portfolioData } from '../data/portfolioData';

export default function AboutView({ onBookCall, onOpenContact }) {
  return (
    <div className="flex-1 max-w-[860px] pb-24 font-sans animate-fade-in">
      <div className="flex flex-col gap-10">
        {/* Intro Header */}
        <div className="flex flex-col gap-4">
          <span className="text-[12px] uppercase tracking-wider text-[#b7b2aa] font-medium">
            Background & Philosophy
          </span>
          <h2 className="font-serif text-[40px] leading-[1.15] text-[#1e1e1e]">
            Designing intuitive digital products that bridge business objectives and human joy.
          </h2>
          <p className="text-[16px] text-[#6b665e] leading-relaxed font-light">
            With over 4 years of dedicated experience across e-commerce, enterprise SaaS, and educational technology,
            I craft seamless user journeys, robust design systems, and high-converting interfaces. My process emphasizes
            deep user empathy, rapid iteration, and high-fidelity prototypes that mirror production-ready code.
          </p>
        </div>

        {/* Experience Timeline */}
        <div className="flex flex-col gap-6 pt-4 border-t border-[#f1eee9]">
          <h3 className="text-[18px] font-medium text-[#1e1e1e]">Experience</h3>
          <div className="flex flex-col gap-6">
            {portfolioData.experience.map((exp, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 pb-6 border-b border-[#f1eee9]/60">
                <div className="flex flex-col">
                  <span className="text-[16px] font-medium text-black">{exp.role}</span>
                  <span className="text-[14px] text-[#8a857d]">{exp.company}</span>
                  <p className="text-[14px] text-[#6b665e] font-light mt-1 max-w-xl">
                    {exp.description}
                  </p>
                </div>
                <span className="text-[13px] font-light text-[#b7b2aa] shrink-0">
                  {exp.period}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Core Capabilities */}
        <div className="flex flex-col gap-4 pt-4 border-t border-[#f1eee9]">
          <h3 className="text-[18px] font-medium text-[#1e1e1e]">Core Capabilities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {portfolioData.skills.map((skill, idx) => (
              <div
                key={idx}
                className="bg-[#f9f8f6] border border-[#ede9e2] rounded-[6px] px-3.5 py-2.5 text-[13px] text-[#1e1e1e] font-light"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-[#f5f8f9] border border-[#dce6ea] rounded-[12px] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-6">
          <div className="flex flex-col gap-1">
            <h4 className="text-[18px] font-medium text-black">Have a project in mind?</h4>
            <p className="text-[14px] text-[#6b665e] font-light">
              Let's discuss how we can elevate your product metrics and user satisfaction.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBookCall}
              className="btn-dark-glow px-4 py-2.5 rounded-[6px] text-white text-[14px] font-medium flex items-center gap-2"
            >
              <span>Schedule Call</span>
              <img src="./assets/call-icon.png" alt="" className="w-4 h-3.5 object-contain" />
            </button>
            <button
              onClick={onOpenContact}
              className="bg-white border border-[#ccc] px-4 py-2.5 rounded-[6px] text-black text-[14px] hover:bg-neutral-50 transition-colors"
            >
              Send Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { portfolioData } from '../data/portfolioData';

export default function Sidebar({ activeTab, setActiveTab, onDownloadCV, onOpenContact }) {
  const navItems = [
    { id: 'work', label: 'Work' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <aside className="w-full md:w-[300px] shrink-0 bg-white flex flex-col justify-between py-3 px-6 md:min-h-[calc(100vh-72px)] md:sticky md:top-[72px]">
      <div className="flex flex-col gap-6">
        {/* Profile Card Text */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif font-normal text-[32px] leading-[1.15] tracking-[-0.64px] text-[#1e1e1e] transition-opacity hover:opacity-90">
              {portfolioData.name}
            </h1>
            <p className="font-sans font-light text-[12px] tracking-[-0.24px] text-[#8a857d]">
              {portfolioData.title}
            </p>
          </div>

          <p className="font-sans font-light text-[13px] leading-[20.15px] tracking-[-0.3px] text-[#8a857d]">
            {portfolioData.bio}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-[#f1eee9] w-full" />

        {/* Navigation Sections */}
        <div className="flex flex-col">
          <div className="text-[11px] font-medium tracking-[0.66px] uppercase text-[#b7b2aa] font-sans pb-2">
            Sections
          </div>
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'contact') {
                      onOpenContact();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className="flex items-center justify-between py-[7px] w-full group text-left cursor-pointer transition-colors"
                >
                  <span
                    className={`text-[13px] tracking-[-0.3px] transition-colors duration-300 font-sans ${
                      isActive
                        ? 'text-black font-medium underline underline-offset-4 decoration-1'
                        : 'text-[#8a857d] font-normal group-hover:text-black'
                    }`}
                  >
                    {item.label}
                  </span>
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="currentColor"
                      className={`transition-colors duration-300 ${
                        isActive
                          ? 'text-black'
                          : 'text-[#B7B2AA] group-hover:text-black'
                      }`}
                    >
                      <path d="M5.33333 0L4.39333 0.94L8.11333 4.66666H0V6H8.11333L4.39333 9.72663L5.33333 10.6666L10.6666 5.33333L5.33333 0Z" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Icons & Buttons */}
      <div className="flex flex-col gap-3 pt-8 pb-4">
        {/* Social Icons - color and opacity transition only */}
        <div className="flex items-center justify-center gap-2.5">
          <a
            href={portfolioData.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-none opacity-60 hover:opacity-100 hover:bg-[#f5f3ef] transition-all duration-300"
            title="LinkedIn"
          >
            <img src="./assets/linkedin.svg" alt="LinkedIn" className="w-5 h-5" />
          </a>
          <a
            href={portfolioData.socials.x}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-none opacity-60 hover:opacity-100 hover:bg-[#f5f3ef] transition-all duration-300"
            title="X (Twitter)"
          >
            <img src="./assets/x.svg" alt="X" className="w-5 h-5" />
          </a>
          <a
            href={portfolioData.socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-none opacity-60 hover:opacity-100 hover:bg-[#f5f3ef] transition-all duration-300"
            title="Facebook"
          >
            <img src="./assets/facebook.svg" alt="Facebook" className="w-5 h-5" />
          </a>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={onDownloadCV}
            className="btn-dark-glow flex-1 h-[48px] px-3 py-2 rounded-none flex items-center justify-center gap-2 group cursor-pointer"
          >
            <img
              src="./assets/download.svg"
              alt=""
              className="w-5 h-5 object-contain"
            />
            <span className="font-geist font-medium text-[14px] text-[#fbf5ef] tracking-[-0.28px] whitespace-nowrap">
              Download CV
            </span>
          </button>
          
          <button
            onClick={onOpenContact}
            className="w-[48px] h-[48px] bg-white border border-[#efefef] rounded-none flex items-center justify-center hover:bg-[#fbf9f6] transition-colors duration-300 cursor-pointer shadow-[0px_2px_4px_rgba(0,0,0,0.04)] shrink-0"
            title="Send Email"
          >
            <img src="./assets/envelope.svg" alt="Email" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

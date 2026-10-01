import React from 'react';

export default function Navbar({ onBookCall, onOpenMobileMenu, isMobileMenuOpen, activeTab, setActiveTab }) {
  return (
    <header className="w-full h-[72px] bg-white flex items-center justify-between sticky top-0 z-40 px-6 max-w-[1440px] mx-auto">
      {/* Left Slot: Logo aligning with sidebar */}
      <div className="w-[252px] md:w-[276px] flex items-center">
        <button
          onClick={() => setActiveTab('work')}
          className="flex items-center gap-2 group transition-opacity hover:opacity-80 text-left focus:outline-none"
        >
          <img
            src="./assets/logo.png"
            alt="Donny Ridwan Logo"
            className="h-[31.3px] w-auto object-contain"
          />
        </button>
      </div>

      {/* Right Slot: Book Call Button & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBookCall}
          data-cal-link="donnyrs/30min"
          data-cal-namespace="30min"
          data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
          className="btn-dark-glow h-[36px] px-[12px] py-[8px] rounded-none flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span className="font-sans font-medium text-[14px] text-white tracking-[-0.28px] whitespace-nowrap leading-none">
            Book 15 Mins Call
          </span>
          <img
            src="./assets/call-icon.png"
            alt="Call"
            className="w-[17px] h-[14px] object-contain"
          />
        </button>

        {/* Mobile menu button for small screens */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-neutral-700 hover:text-black focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WorkGrid from './components/WorkGrid';
import ChatView from './components/ChatView';
import AboutView from './components/AboutView';
import BookingModal from './components/BookingModal';
import ContactModal from './components/ContactModal';
import ProjectModal from './components/ProjectModal';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (['work', 'about', 'chat'].includes(hash)) return hash;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (['work', 'about', 'chat'].includes(tab)) return tab;
    return 'work';
  });

  const changeTab = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadCV = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
    });
    showToast("CV downloaded successfully! Thank you for your interest.");

    // Generate download link for a simulated or real CV PDF
    const cvText = `DONNY RIDWAN S - UI/UX DESIGNER & WEB DESIGNER\nEmail: donnyr65@gmail.com\nPortfolio: https://donnyridwan.github.io\n\nExperience: 4+ years in e-commerce, SaaS, and EdTech.\nSpecialties: Figma, Prototyping, Design Systems, Conversion UX.`;
    const blob = new Blob([cvText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Donny_Ridwan_S_CV.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white text-[#1e1e1e] flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* Navbar */}
      <Navbar
        onBookCall={() => setIsBookingOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={changeTab}
      />

      {/* Main Body Layout matching 1440px desktop frame */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col md:flex-row relative">
        {/* Sidebar */}
        <div className={`md:block ${isMobileMenuOpen ? 'block' : 'hidden'} z-20`}>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              changeTab(tab);
              setIsMobileMenuOpen(false);
            }}
            onDownloadCV={handleDownloadCV}
            onOpenContact={() => setIsContactOpen(true)}
          />
        </div>

        {/* Content Pane */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-w-0">
          {activeTab === 'work' && (
            <WorkGrid
              onSelectProject={(proj) => setSelectedProject(proj)}
              onOpenChat={() => changeTab('chat')}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              onClose={() => changeTab('work')}
              onBookCall={() => setIsBookingOpen(true)}
            />
          )}

          {activeTab === 'about' && (
            <AboutView
              onBookCall={() => setIsBookingOpen(true)}
              onOpenContact={() => setIsContactOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-5 py-3 rounded-full text-sm font-sans shadow-xl animate-fade-in flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Interactive Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onBookCall={() => setIsBookingOpen(true)}
      />
    </div>
  );
}

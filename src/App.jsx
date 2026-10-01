import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
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

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize luxury weighted smooth scroll (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5, // Extended deceleration for luxury feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential luxury ease
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.72, // Heavier, weighted inertial feel ("feel agak berat")
      touchMultiplier: 1.2,
      infinite: false,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const changeTab = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadCV = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#000000', '#444444', '#b7b2aa', '#e7eef0'],
    });
    showToast("CV downloaded successfully! Thank you for your interest.");

    const cvText = `DONNY RIDWAN S - UI/UX DESIGNER & WEB DESIGNER\nEmail: donnyr65@gmail.com\nPortfolio: https://donnyridwan.github.io/personal-portfolio/\n\nExperience: 4+ years in e-commerce, SaaS, and EdTech.\nSpecialties: Figma, Prototyping, Design Systems, Conversion UX.`;
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

        {/* Content Pane with Framer Motion luxury transitions */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'work' && (
              <motion.div
                key="work"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex-1"
              >
                <WorkGrid
                  onSelectProject={(proj) => setSelectedProject(proj)}
                  onOpenChat={() => changeTab('chat')}
                />
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, scale: 0.98, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex-1"
              >
                <ChatView
                  onClose={() => changeTab('work')}
                  onBookCall={() => setIsBookingOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex-1"
              >
                <AboutView
                  onBookCall={() => setIsBookingOpen(true)}
                  onOpenContact={() => setIsContactOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Luxury Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#141414] text-white px-5 py-3 rounded-none text-[13.5px] font-sans shadow-2xl flex items-center gap-2.5 border border-white/10 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Modals with Framer Motion luxury transitions */}
      <AnimatePresence>
        {isBookingOpen && (
          <BookingModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isContactOpen && (
          <ContactModal
            isOpen={isContactOpen}
            onClose={() => setIsContactOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onBookCall={() => setIsBookingOpen(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

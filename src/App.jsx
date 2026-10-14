import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import Lenis from 'lenis';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import Sidebar, { ProfileIntro } from './components/Sidebar';
import WorkGrid from './components/WorkGrid';
import ChatView from './components/ChatView';
import AboutView from './components/AboutView';
import ContactView from './components/ContactView';
import ProjectDetail from './components/ProjectDetail';
import CmsLogin from './components/cms/CmsLogin';
import CmsDashboard from './components/cms/CmsDashboard';
import { portfolioData } from './data/portfolioData';
import { fetchPortfolioFromNeon } from './lib/neon';
import { parseRoute, projectPath } from './lib/route';
import { findPublishedProject } from './lib/projects';

export default function App() {
  const readRoute = () =>
    typeof window === 'undefined'
      ? { view: 'work' }
      : parseRoute(window.location.pathname, window.location.hash, window.location.search);

  const [activeTab, setActiveTab] = useState(() => readRoute().view);
  const [projectSlug, setProjectSlug] = useState(() => readRoute().slug || null);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const originalTitle = useRef(typeof document !== 'undefined' ? document.title : '');

  const [previousTab, setPreviousTab] = useState('work');
  const previousSlug = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [livePortfolio, setLivePortfolio] = useState(portfolioData);
  const [isCmsAuth, setIsCmsAuth] = useState(() => {
    return typeof window !== 'undefined' && Boolean(sessionStorage.getItem('cms_auth_token'));
  });

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

  // Sync live data from Neon Database on mount with graceful fallback
  useEffect(() => {
    let isMounted = true;
    async function loadPortfolio() {
      try {
        const fresh = await fetchPortfolioFromNeon();
        if (isMounted && fresh) {
          setLivePortfolio(fresh);
        }
      } catch (err) {
        console.warn('Neon DB sync notice: using default/cached portfolio data', err);
      } finally {
        if (isMounted) setIsPortfolioLoading(false);
      }
    }
    loadPortfolio();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to hash and popstate changes (e.g., #cms, #admin, /admin, /cms, #work, #about)
  useEffect(() => {
    const handleUrlChange = () => {
      const route = readRoute();
      setActiveTab(route.view);
      setProjectSlug(route.slug || null);
    };
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setProjectSlug(null);
    setIsMobileMenuOpen(false);
    if (window.location.pathname.startsWith('/work/')) {
      // Leaving a project page: pushState does not fire hashchange, so state is set above
      window.history.pushState(null, '', `/#${tab}`);
      window.scrollTo({ top: 0 });
    } else {
      window.location.hash = tab;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openProject = (slug) => {
    window.history.pushState(null, '', projectPath(slug));
    setProjectSlug(slug);
    setActiveTab('project');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  // Until live data arrives the fallback demo projects must not resolve, or a quick visitor
  // would see a demo case study that flips to "not found" a moment later
  const currentProject =
    activeTab === 'project' && !isPortfolioLoading
      ? findPublishedProject(livePortfolio.projects, projectSlug)
      : null;

  useEffect(() => {
    document.title = currentProject ? `${currentProject.title.trim()} — Donny Ridwan S` : originalTitle.current;
  }, [currentProject]);

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

  const handleBookCall = () => {
    changeTab('contact');
  };

  // Dedicated full-screen CMS portal
  if (activeTab === 'cms') {
    if (!isCmsAuth) {
      return (
        <CmsLogin
          onLoginSuccess={() => setIsCmsAuth(true)}
          onCancel={() => changeTab('work')}
        />
      );
    }
    return (
      <CmsDashboard
        portfolio={livePortfolio}
        onUpdatePortfolio={(updated) => setLivePortfolio(updated)}
        onExitCms={() => {
          sessionStorage.removeItem('cms_auth_token');
          setIsCmsAuth(false);
          if (window.location.pathname.includes('admin') || window.location.pathname.includes('cms')) {
            window.history.pushState(null, '', window.location.pathname.replace(/\/admin\/?|\/cms\/?/i, '/') || '/');
          }
          changeTab('work');
        }}
      />
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div
      className="min-h-screen bg-white text-[#1e1e1e] flex flex-col font-sans selection:bg-neutral-900 selection:text-white"
    >
      {/* Navbar */}
      <Navbar
        onBookCall={handleBookCall}
        onOpenMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        activeTab={activeTab === 'project' ? 'work' : activeTab}
        setActiveTab={changeTab}
      />

      {/* Main Body Layout matching 1440px desktop frame */}
      <div className="flex-1 w-full flex flex-col lg:flex-row relative">
        {/* Sidebar */}
        <div
          data-lenis-prevent
          className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block fixed inset-x-0 top-[72px] bottom-0 overflow-y-auto bg-white z-30 lg:static lg:overflow-visible lg:z-20`}
        >
          <Sidebar
            portfolio={livePortfolio}
            activeTab={activeTab === 'project' ? 'work' : activeTab}
            setActiveTab={(tab) => {
              changeTab(tab);
              setIsMobileMenuOpen(false);
            }}
            onDownloadCV={handleDownloadCV}
            onOpenContact={() => changeTab('contact')}
          />
        </div>

        {/* Profile intro on mobile & tablet (desktop shows it in the sidebar) */}
        {activeTab !== 'chat' && activeTab !== 'project' && (
          <ProfileIntro
            portfolio={livePortfolio}
            onDownloadCV={handleDownloadCV}
            onOpenContact={() => changeTab('contact')}
          />
        )}

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
                  projects={livePortfolio.projects}
                  isLoading={isPortfolioLoading}
                  onOpenProject={openProject}
                />
              </motion.div>
            )}

            {activeTab === 'project' && (
              <motion.div
                key={`project-${projectSlug}`}
                // transitions.dev "Page side-by-side": 8px slide + 3px blur over 250ms
                initial={{ opacity: 0, x: 8, filter: 'blur(3px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -8, filter: 'blur(3px)' }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex-1"
              >
                <ProjectDetail
                  project={currentProject}
                  projects={livePortfolio.projects}
                  isLoading={isPortfolioLoading}
                  onOpenProject={openProject}
                  onBack={() => changeTab('work')}
                  onBookCall={handleBookCall}
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
                  onClose={() =>
                    previousTab === 'project' && previousSlug.current
                      ? openProject(previousSlug.current)
                      : changeTab(previousTab || 'work')
                  }
                  onBookCall={handleBookCall}
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
                  portfolio={livePortfolio}
                  onBookCall={handleBookCall}
                  onOpenContact={() => changeTab('contact')}
                />
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex-1 h-full flex flex-col"
              >
                <ContactView />
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-max max-w-[calc(100vw-32px)] bg-[#141414] text-white px-5 py-3 rounded-none text-[13.5px] font-sans shadow-2xl flex items-center gap-2.5 border border-white/10 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Global Floating Chat Trigger Button - visible across all pages */}
      <AnimatePresence>
        {activeTab !== 'chat' && !isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-30"
          >
            <button
              onClick={() => {
                setPreviousTab(activeTab);
                previousSlug.current = projectSlug;
                changeTab('chat');
              }}
              style={{ borderRadius: '9999px' }}
              className="btn-dark-glow w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group"
              title="Chat With Jhonny"
            >
              <img
                src="/assets/bot-icon.svg"
                alt="Chat Bot"
                className="w-[42px] h-[42px] object-contain group-hover:rotate-12 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar, Header, BottomNav } from './components/Navigation';
import { cn } from './utils/cn';
import { authService } from './services/authService';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Pricing } from './pages/Pricing';
import { Settings } from './pages/Settings';
import { Library } from './pages/Library';
import { AIAssistant } from './pages/AIAssistant';
import { PrivacyPolicy, TermsOfService } from './pages/Legal';
import { HelpCenter } from './pages/HelpCenter';
import { Quiz } from './pages/Quiz';
import { TutorChat } from './pages/TutorChat';
import { Solver } from './pages/Solver';
import { VideoLab } from './pages/VideoLab';
import { Onboarding } from './pages/Onboarding';
import { Auth } from './pages/Auth';
import { AnimatePresence, motion } from 'framer-motion';

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  const getTitle = (path: string) => {
    switch (path) {
      case '/': return 'Hello, Marko';
      case '/library': return 'My Library';
      case '/assistant': return 'AI Assistant';
      case '/solver': return 'Solver Hub';
      case '/video-lab': return 'Video Lab';
      case '/upload': return 'New Scan';
      case '/pricing': return 'Plans';
      case '/settings': return 'Settings';
      case '/onboarding': 
      case '/auth': return '';
      default: return 'Edu-Flash';
    }
  };

  const isFullPage = location.pathname === '/onboarding' || location.pathname === '/auth';

  return (
    <div className="flex min-h-screen bg-[var(--background)] transition-colors duration-300">
      {!isFullPage && <Sidebar />}
      <div className={cn("flex-1 flex flex-col w-full min-w-0", !isFullPage && "lg:ml-72")}>
        {!isFullPage && <Header title={getTitle(location.pathname)} />}
        <main className={cn("flex-1 relative", !isFullPage ? "pt-4 md:pt-8 pb-32 md:pb-20 px-4 md:px-0" : "")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        {!isFullPage && <BottomNav />}
      </div>
    </div>
  );
};

function App() {
  const [onboarded, setOnboarded] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const isLocal = localStorage.getItem('edu_onboarded') === 'true';
    setOnboarded(isLocal);
    
    // Auto-redirect if not onboarded and not already on the page
    if (!isLocal && window.location.pathname !== '/onboarding') {
      window.location.pathname = '/onboarding';
    }
    
    const unsubscribe = authService.onAuthChange((user) => {
      if (user && user.emailVerified) {
         // User is logged in and verified
      } else if (isLocal && window.location.pathname !== '/auth' && window.location.pathname !== '/onboarding') {
         // Not logged in or verified, but saw onboarding -> go to auth
         window.location.pathname = '/auth';
      }
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  if (onboarded === null && window.location.pathname !== '/onboarding' && window.location.pathname !== '/auth') {
    return <div className="h-screen bg-[var(--background)]" />;
  }

  return (
    <Router>
      <PageWrapper>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/solver" element={<Solver />} />
          <Route path="/video-lab" element={<VideoLab />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/tutor" element={<TutorChat />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </PageWrapper>
    </Router>
  );
}

export default App;

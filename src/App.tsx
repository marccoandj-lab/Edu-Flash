import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Sidebar, Header, BottomNav } from './components/Navigation';
import { cn } from './utils/cn';
import { authService } from './services/authService';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Pricing } from './pages/Pricing';
import { Settings } from './pages/Settings';
import { Library } from './pages/Library';
import { AIAssistant } from './pages/AIAssistant';
import { PrivacyPolicy, TermsOfService, RefundPolicy } from './pages/Legal';
import { HelpCenter } from './pages/HelpCenter';
import { Quiz } from './pages/Quiz';
import { TutorChat } from './pages/TutorChat';
import { Solver } from './pages/Solver';
import { VideoLab } from './pages/VideoLab';
import { Onboarding } from './pages/Onboarding';
import { Auth } from './pages/Auth';
import { AnimatePresence, motion } from 'framer-motion';

import { useUser } from './contexts/UserContext';

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { profile } = useUser();
  
  const getTitle = (path: string) => {
    switch (path) {
      case '/': return `Hello, ${profile?.displayName || 'Student'}`;
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

import { UserProvider } from './contexts/UserContext';

import { RequireAuth } from './components/RequireAuth';

function App() {
  const [onboarded, setOnboarded] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const isLocal = localStorage.getItem('edu_onboarded') === 'true';
    setOnboarded(isLocal);
  }, []);

  if (onboarded === null) {
    return <div className="h-screen bg-[var(--background)]" />;
  }

  return (
    <UserProvider>
      <Router>
        <PageWrapper>
          <Routes>
            {/* Public Routes */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/refund" element={<RefundPolicy />} />

            {/* Protected Routes */}
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
            <Route path="/assistant" element={<RequireAuth><AIAssistant /></RequireAuth>} />
            <Route path="/solver" element={<RequireAuth><Solver /></RequireAuth>} />
            <Route path="/video-lab" element={<RequireAuth><VideoLab /></RequireAuth>} />
            <Route path="/upload" element={<RequireAuth><Upload /></RequireAuth>} />
            <Route path="/pricing" element={<RequireAuth><Pricing /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/help" element={<RequireAuth><HelpCenter /></RequireAuth>} />
            <Route path="/quiz" element={<RequireAuth><Quiz /></RequireAuth>} />
            <Route path="/tutor" element={<RequireAuth><TutorChat /></RequireAuth>} />
            
            <Route path="*" element={<Navigate to={onboarded ? "/" : "/onboarding"} replace />} />
          </Routes>
        </PageWrapper>
      </Router>
    </UserProvider>
  );
}

export default App;

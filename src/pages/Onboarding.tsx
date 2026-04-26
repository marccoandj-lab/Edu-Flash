import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BrainCircuit, 
  Zap, 
  Rocket, 
  ChevronRight, 
  ShieldCheck, 
  Globe, 
  Star,
  Calculator,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../utils/cn';

function CheckCircle2({ size, className }: { size: number, className?: string }) {
  return <div className={className}><GraduationCap size={size} /></div>;
}

export const Onboarding = () => {
  const STEPS = [
    {
      id: 'hero',
      title: "Future of Learning is Here",
      description: "Experience a quantum leap in academic productivity with high-density AI intelligence.",
      icon: <Sparkles className="w-12 h-12 text-indigo-400" />,
      color: "from-indigo-600 to-purple-600",
      visual: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"
          />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-32 h-32 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 flex items-center justify-center shadow-2xl"
          >
            <Rocket size={48} className="text-white" />
          </motion.div>
        </div>
      )
    },
    {
      id: 'solver',
      title: "The Ultimate Solver",
      description: "Scan complex Math, Physics or Chemistry problems and get verified PhD-level solutions instantly.",
      icon: <Calculator className="w-12 h-12 text-emerald-400" />,
      color: "from-emerald-600 to-teal-600",
      visual: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="w-64 h-40 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden p-4">
              <div className="w-full h-full border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <motion.div 
                      animate={{ y: [0, 80, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_#34d399]"
                  />
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Scanning Problem...</span>
              </div>
          </div>
        </div>
      )
    },
    {
      id: 'assistant',
      title: "AI Study Partner",
      description: "Summarize 100-page PDFs into key insights or expand notes into comprehensive study guides.",
      icon: <Layers className="w-12 h-12 text-blue-400" />,
      color: "from-blue-600 to-cyan-600",
      visual: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                  <motion.div 
                      key={i}
                      animate={{ y: [0, -10 * i, 0], rotate: [0, 5 * i, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
                      className="w-16 h-24 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center shadow-2xl"
                  >
                      <div className="w-8 h-1 bg-white/20 rounded-full" />
                  </motion.div>
              ))}
          </div>
        </div>
      )
    },
    {
      id: 'trust',
      title: "Join the Elite",
      description: "Used by over 50,000 top students to dominate their exams and master complex subjects.",
      icon: <ShieldCheck className="w-12 h-12 text-amber-400" />,
      color: "from-amber-600 to-orange-600",
      visual: (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
              >
                  <Star size={16} className="text-amber-400 fill-amber-400" />
              </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'paywall',
      title: "Master the Course",
      description: "Unlock unlimited scans, advanced reasoning models, and personalized AI tutoring.",
      icon: <Zap className="w-12 h-12 text-indigo-400" />,
      color: "from-indigo-600 to-blue-600",
      visual: (
        <div className="w-full max-w-sm mx-auto bg-white/5 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
              <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Premium Plan</p>
                  <p className="text-2xl font-black text-white italic">$9.99<span className="text-sm opacity-40 font-bold not-italic">/mo</span></p>
              </div>
              <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-[8px] font-black text-indigo-300 uppercase tracking-widest">70% OFF</div>
          </div>
          <div className="space-y-3 mb-6">
              {["Unlimited AI Solves", "Priority LPU Access", "No Ads", "Sync All Devices"].map((f) => (
                  <div key={f} className="flex items-center gap-3 text-white/60 text-xs font-bold">
                      <CheckCircle2 size={14} className="text-emerald-400" /> {f}
                  </div>
              ))}
          </div>
          <button onClick={() => navigate('/auth')} className="w-full py-3 bg-white text-[#1e3a8a] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl mb-3">Get Started Now</button>
          <button onClick={() => navigate('/auth')} className="w-full py-2 text-white/30 hover:text-white transition-colors font-black text-[8px] uppercase tracking-widest">Continue with free plan</button>
        </div>
      )
    }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const step = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem('edu_onboarded', 'true');
      navigate('/auth');
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#020617] flex flex-col overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn("absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-20 transition-all duration-1000 bg-gradient-to-br", step.color)} />
        <div className={cn("absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-10 transition-all duration-1000 bg-gradient-to-tl", step.color)} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg text-center"
          >
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center mx-auto mb-10 shadow-2xl backdrop-blur-xl">
              {step.icon}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-[0.9] mb-6">
              {step.title}
            </h1>
            
            <p className="text-white/60 text-lg font-medium leading-relaxed mb-12">
              {step.description}
            </p>

            <div className="mb-12">
              {step.visual}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-10 relative z-10 bg-gradient-to-t from-black/50 to-transparent">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-8">
          {/* Progress Indicators */}
          <div className="flex gap-3">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === currentStep ? "w-10 bg-white" : "w-2 bg-white/20"
                )} 
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="w-full py-6 bg-white text-[#1e3a8a] rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
          >
            {currentStep === STEPS.length - 1 ? "Start Free Journey" : "Next Step"}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={() => navigate('/')}
            className="text-white/30 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
          >
            Skip Intro
          </button>
          
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 text-[8px] sm:text-[9px] text-white/40 uppercase tracking-widest font-black">
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
            <a href="mailto:support@edu-flash.com" className="hover:text-white transition-colors">Contact: support@edu-flash.com</a>
          </div>
        </div>
      </div>

      {/* Decorative branding */}
      <div className="absolute top-10 left-10 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#1e3a8a] font-black italic shadow-xl">E</div>
        <span className="text-white font-black text-xs uppercase tracking-widest opacity-40">Edu-Flash AI</span>
      </div>
    </div>
  );
};

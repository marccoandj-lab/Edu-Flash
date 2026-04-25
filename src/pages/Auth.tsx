import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { cn } from '../utils/cn';

export const Auth = () => {
  const [type, setType] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (type === 'signup') {
        await authService.signUp(email, password);
        setSuccess("Account created! Please check your email for verification link.");
        setTimeout(() => setType('login'), 3000);
      } else {
        await authService.login(email, password);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-[#020617] flex items-center justify-center p-6 overflow-y-auto">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-8 sm:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#1e3a8a] font-black italic shadow-xl mx-auto mb-6 scale-110">E</div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
                {type === 'login' ? 'Welcome Back' : 'Join the Hub'}
            </h2>
            <p className="text-white/40 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">
                {type === 'login' ? 'Access your intelligence' : 'Start your AI journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Email Address</label>
                <div className="relative">
                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                        type="email" required
                        value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10"
                        placeholder="name@example.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Security Key</label>
                <div className="relative">
                    <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                        type="password" required
                        value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs font-bold">
                        <AlertCircle size={16} /> {error}
                    </motion.div>
                )}
                {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 size={16} /> {success}
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                type="submit" disabled={loading}
                className="w-full py-5 bg-white text-[#1e3a8a] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" /> : (type === 'login' ? 'Initialize' : 'Create Account')}
                {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-[#020617] px-4 text-white/20">Third Party Auth</span></div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
                onClick={handleGoogleLogin} disabled={loading}
                className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
            >
                <Globe size={18} /> Continue with Google
            </button>
          </div>

          <div className="mt-10 text-center">
            <button 
                onClick={() => setType(type === 'login' ? 'signup' : 'login')}
                className="text-white/40 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest"
            >
                {type === 'login' ? "Don't have an account? Join" : "Already registered? Initialize"}
            </button>
          </div>
        </div>

        <button 
            onClick={() => navigate('/onboarding')}
            className="mt-8 flex items-center justify-center gap-2 text-white/20 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest w-full"
        >
            <ChevronLeft size={14} /> Back to Onboarding
        </button>
      </motion.div>
    </div>
  );
};

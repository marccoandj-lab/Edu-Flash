
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayCircle, 
  Loader2, 
  Sparkles, 
  Layers, 
  AlertCircle,
  Link as LinkIcon,
  FileText,
  TrendingUp
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { cn } from '../utils/cn';
import { VideoAnalysis } from '../types';

export const VideoLab = () => {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFlipped, setActiveFlipped] = useState<number[]>([]);

  const getYouTubeId = (url: string) => {
    const videoIdMatch = url.match(/(?:v=|\/embed\/|youtu.be\/)([^&?#]+)/);
    return videoIdMatch?.[1];
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    const videoId = getYouTubeId(url);
    if (!videoId) {
        setError("Invalid YouTube URL. Please use a standard video link.");
        return;
    }

    setIsProcessing(true);
    setError(null);
    setAnalysis(null);
    
    try {
        const userId = 'user123';
        const result = await apiService.processVideoWithAI(userId, url);
        setAnalysis(result);
        
        // Auto-save the results to the library for future access
        const currentCards = JSON.parse(localStorage.getItem('edu_cards') || '[]');
        const newCards = result.flashcards.map((p: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            uid: userId,
            question: p.question,
            answer: p.answer,
            category: "Video Analysis",
            type: 'qa',
            next_review: new Date().toISOString(),
            correct_count: 0,
            wrong_count: 0,
            ease_factor: 2.5,
            interval_days: 0,
            created_at: new Date().toISOString()
        }));
        localStorage.setItem('edu_cards', JSON.stringify([...currentCards, ...newCards]));

        // Save summary to analyses
        const currentAnalyses = JSON.parse(localStorage.getItem('edu_analyses') || '[]');
        currentAnalyses.push({
            id: Math.random().toString(36).substr(2, 9),
            uid: userId,
            mode: 'summarize',
            content: result.summary,
            category: "Video Study",
            originalFileName: `YouTube: ${videoId.substring(0,6)}`,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('edu_analyses', JSON.stringify(currentAnalyses));

    } catch (err: any) {
        setError(err.message || "Failed to analyze video.");
    } finally {
        setIsProcessing(false);
    }
  };

  const toggleFlip = (index: number) => {
      setActiveFlipped(prev => 
          prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
  };

  return (
    <div className="px-6 lg:px-10 pb-32 max-w-5xl mx-auto bg-transparent">
      <div className="mb-12 text-center lg:text-left">
        <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase italic leading-tight">Video Lab</h2>
        <p className="text-white/40 font-bold text-sm uppercase tracking-[0.4em] mt-3">Convert YouTube Tutorials to Knowledge</p>
      </div>

      {!analysis && !isProcessing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--surface)] rounded-[3.5rem] border border-white/10 p-10 lg:p-14 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-rose-500/20 text-rose-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl">
                    <PlayCircle size={48} fill="currentColor" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight">Enter Video URL</h3>
                <p className="text-white/40 font-medium mb-10 text-sm leading-relaxed">
                    Paste any YouTube educational link. We'll extract the transcript and use Llama 3.3 to build your study set.
                </p>
                <div className="w-full relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors">
                        <LinkIcon size={20} />
                    </div>
                    <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-white font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10 shadow-inner"
                    />
                </div>
                <button onClick={handleAnalyze} disabled={!url.trim()}
                    className="mt-10 w-full py-6 bg-white text-[#1e3a8a] rounded-[2rem] font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-30"
                >
                    <Sparkles size={24} /> Generate Study Set
                </button>
            </div>
            <div className="absolute -bottom-20 -right-20 opacity-[0.02] text-white pointer-events-none">
                <PlayCircle size={400} />
            </div>
        </motion.div>
      )}

      {isProcessing && (
          <div className="py-32 text-center bg-white/5 rounded-[4rem] border border-white/10 shadow-2xl">
              <Loader2 size={64} className="text-white animate-spin mx-auto mb-10 opacity-60" />
              <h3 className="text-3xl font-black text-white tracking-tight italic">AI Laboratory Working...</h3>
              <p className="text-white/40 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">Fetching transcript & generating insights</p>
          </div>
      )}

      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
            {/* Summary & Tags */}
            <div className="bg-[var(--surface)] rounded-[3rem] border border-white/10 p-10 shadow-2xl overflow-hidden relative">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{analysis.difficulty}</span>
                    </div>
                    <div className="flex gap-2">
                        {analysis.topics.map(topic => (
                            <span key={topic} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/60 uppercase tracking-widest italic">{topic}</span>
                        ))}
                    </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-4 italic flex items-center gap-3">
                    <FileText size={24} className="text-indigo-400" /> Summary
                </h3>
                <p className="text-white/80 font-medium leading-relaxed text-lg mb-8">{analysis.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.key_points.map((point, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-black text-xs">{i+1}</div>
                            <p className="text-white/70 text-sm font-bold leading-snug">{point}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flashcards */}
            <div className="space-y-8">
                <h3 className="text-2xl font-black text-white italic px-4 flex items-center gap-3">
                    <Layers size={24} className="text-emerald-400" /> Generated Flashcards
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysis.flashcards.map((card, i) => (
                        <motion.div key={i} onClick={() => toggleFlip(i)} className="perspective-1000 h-[250px] cursor-pointer">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={activeFlipped.includes(i) ? 'back' : 'front'}
                                    initial={{ rotateY: activeFlipped.includes(i) ? -180 : 180, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    exit={{ rotateY: activeFlipped.includes(i) ? 180 : -180, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className={cn(
                                        "w-full h-full rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-xl border-2 transition-all relative overflow-hidden",
                                        activeFlipped.includes(i) ? "bg-white text-[var(--background)] border-white" : "bg-[var(--surface)] text-white border-white/10"
                                    )}
                                >
                                    <span className="absolute top-6 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-black/5">
                                        {activeFlipped.includes(i) ? 'Answer' : 'Question'}
                                    </span>
                                    <p className="font-black text-base lg:text-lg leading-tight">{activeFlipped.includes(i) ? card.answer : card.question}</p>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="text-center pb-20">
                <button onClick={() => setAnalysis(null)} className="px-12 py-5 bg-white text-[#1e3a8a] rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">New Video Scan</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
          <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[3rem] flex items-start gap-6 text-white max-w-2xl mx-auto animate-in zoom-in">
            <AlertCircle size={32} className="shrink-0 text-rose-400" />
            <div>
                <p className="font-black text-sm uppercase tracking-widest mb-1 text-rose-300">Attention Required</p>
                <p className="text-base font-bold opacity-80 leading-snug">{error}</p>
                <button onClick={() => setAnalysis(null)} className="mt-4 px-6 py-2 bg-white text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Retry</button>
            </div>
          </div>
      )}
    </div>
  );
};

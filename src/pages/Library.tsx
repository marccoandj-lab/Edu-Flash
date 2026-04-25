import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  ChevronLeft, 
  Search, 
  X,
  FileText,
  Copy,
  Check,
  Calendar,
  Minimize2,
  Maximize2,
  Trash2,
  Volume2,
  ThumbsDown,
  ThumbsUp,
  CheckCircle,
  Star,
  BrainCircuit,
  MessageCircle,
  Folder,
  Tag
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { Flashcard, AIAnalysis } from '../types';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../contexts/UserContext';

export const Library = () => {
  const { user: authUser } = useUser();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'flashcards' | 'analyses'>('flashcards');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AIAnalysis | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const checkVoices = () => {
      window.speechSynthesis.getVoices();
    };
    checkVoices();
    window.speechSynthesis.onvoiceschanged = checkVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!authUser) return;
      try {
        const userId = authUser.uid;
        const [cardsData, analysesData] = await Promise.all([
          apiService.getFlashcards(userId),
          apiService.getAnalyses(userId)
        ]);
        setCards(cardsData || []);
        setAnalyses(analysesData || []);
      } catch (error) {
        console.error("Library error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = Array.from(new Set([
      ...cards.map((c: Flashcard) => c.category),
      ...analyses.map((a: AIAnalysis) => a.category)
  ])).filter(Boolean) as string[];

  const filteredCards = cards.filter((c: Flashcard) => {
    const matchesSearch = c.question.toLowerCase().includes(searchQuery.toLowerCase()) || c.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredAnalyses = analyses.filter((a: AIAnalysis) => {
    const matchesSearch = (a.originalFileName || "").toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const nextCard = () => {
    if (activeCardIndex !== null && activeCardIndex < filteredCards.length - 1) {
        setIsFlipped(false);
        setActiveCardIndex(activeCardIndex + 1);
    } else {
        setActiveCardIndex(null);
    }
  };

  const copyAnalysis = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const getBestVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        // Priority: Serbian, Croatian, Bosnian
        const preferred = ['sr', 'hr', 'bs'];
        for (const lang of preferred) {
            const found = voices.find(v => v.lang.startsWith(lang));
            if (found) return found;
        }
        return voices[0];
    };

    const voice = getBestVoice();
    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
    } else {
        utterance.lang = 'sr-RS';
    }

    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDeleteCard = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this card?")) {
        await apiService.deleteFlashcard(id);
        setCards(cards.filter((c: Flashcard) => c.id !== id));
    }
  };

  const handleDeleteAnalysis = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this analysis?")) {
        await apiService.deleteAnalysis(id);
        setAnalyses(analyses.filter((a: AIAnalysis) => a.id !== id));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="px-6 lg:px-10 pb-32 bg-transparent">
      {/* Search & Switcher */}
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{tab === 'flashcards' ? 'Library' : 'AI Analysis'}</h2>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">Personal Study Records</p>
            </div>
            <div className="flex p-1.5 bg-white/5 rounded-[2rem] border border-white/10 shadow-xl">
                <button onClick={() => setTab('flashcards')} className={cn("px-6 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all", tab === 'flashcards' ? "bg-white text-[#1e3a8a] shadow-xl" : "text-white/40 hover:text-white")}>Flashcards</button>
                <button onClick={() => setTab('analyses')} className={cn("px-6 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all", tab === 'analyses' ? "bg-white text-[#1e3a8a] shadow-xl" : "text-white/40 hover:text-white")}>Assistant</button>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                <input type="text" placeholder="Search across all knowledge..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-[1.8rem] text-sm font-bold text-white focus:outline-none focus:border-white/40 transition-all placeholder:text-white/20"
                />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                <button onClick={() => setSelectedCategory(null)} className={cn("px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border", !selectedCategory ? "bg-white text-[#1e3a8a] border-white shadow-xl" : "bg-white/5 text-white/40 border-white/10")}>All</button>
                {categories.map((cat: string) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border", selectedCategory === cat ? "bg-white text-[#1e3a8a] border-white shadow-xl" : "bg-white/5 text-white/40 border-white/10")}>
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {tab === 'flashcards' ? (
            filteredCards.length > 0 ? filteredCards.map((card: Flashcard, i: number) => (
                <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setActiveCardIndex(filteredCards.indexOf(card))}
                  className="group bg-[var(--surface)] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl hover:border-white/30 hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
                >
                  <button onClick={(e) => handleDeleteCard(e, card.id)} className="absolute top-6 right-6 p-2 text-white/10 hover:text-rose-400 transition-colors z-10"><Trash2 size={18} /></button>
                  <div className="flex items-center gap-2 mb-4">
                      <Tag size={12} className="text-white/30" />
                      <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">{card.category}</span>
                  </div>
                  <p className="font-black text-white text-lg lg:text-xl leading-tight pr-10">{card.question}</p>
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                      <span className="text-white opacity-40 italic">Study Mode</span>
                      <span>{new Date(card.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              )) : <EmptyState text="No cards in this category" />
        ) : (
            filteredAnalyses.length > 0 ? [...filteredAnalyses].reverse().map((item: AIAnalysis, i: number) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveAnalysis(item)}
                    className="group bg-[var(--surface)] p-8 rounded-[3rem] border border-white/10 shadow-2xl hover:border-white/30 hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                >
                    <button onClick={(e) => handleDeleteAnalysis(e, item.id)} className="absolute top-8 right-8 p-2 text-white/10 hover:text-rose-400 transition-colors z-10"><Trash2 size={20} /></button>
                    <div className="flex items-start gap-5 mb-6 pr-10">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/10 text-white shadow-xl")}>
                            {item.mode === 'summarize' ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-black text-white text-base truncate uppercase tracking-tighter">{item.originalFileName || "Untitled"}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Folder size={10} className="text-white/20" />
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{item.category}</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-white/60 line-clamp-3 mb-8 leading-relaxed italic font-medium">"{item.content.substring(0, 150)}..."</p>
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                         <div className="flex items-center gap-2"><Calendar size={12} />{new Date(item.createdAt).toLocaleDateString()}</div>
                         <span className="text-white opacity-40 italic">View Result</span>
                    </div>
                </motion.div>
            )) : <EmptyState text="No analysis in this category" />
        )}
      </div>

      <AnimatePresence>
        {activeCardIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col items-center p-6 lg:p-12 overflow-hidden"
          >
            <div className="w-full max-w-xl flex items-center justify-between mb-8">
                <button onClick={() => setActiveCardIndex(null)} className="p-4 bg-[var(--surface)] border border-white/10 rounded-3xl text-white shadow-xl"><ChevronLeft size={24} /></button>
                <div className="text-center text-white"><p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Review Mode</p><p className="font-black text-xl">{activeCardIndex + 1} / {filteredCards.length}</p></div>
                <button onClick={() => setActiveCardIndex(null)} className="p-4 bg-[var(--surface)] border border-white/10 rounded-3xl text-white shadow-xl"><X size={24} /></button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl overflow-hidden">
                <div className="perspective-1000 w-full h-[450px] lg:h-[550px] relative mb-12">
                    <AnimatePresence mode="wait">
                        <motion.div key={filteredCards[activeCardIndex].id + (isFlipped ? '-back' : '-front')}
                            initial={{ rotateY: isFlipped ? -180 : 180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: isFlipped ? 180 : -180, opacity: 0 }}
                            transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 20 }}
                            onClick={() => setIsFlipped(!isFlipped)}
                            className={cn(
                                "w-full h-full rounded-[4.5rem] p-10 lg:p-16 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl transition-all relative border-4",
                                isFlipped ? 'bg-white text-[var(--background)] border-white' : 'bg-[var(--surface)] text-white border-white/10'
                            )}
                        >
                            <button onClick={(e) => { e.stopPropagation(); handleSpeak(isFlipped ? filteredCards[activeCardIndex].answer : filteredCards[activeCardIndex].question); }}
                                className={cn("absolute top-8 right-8 p-3 rounded-2xl transition-all z-20", isSpeaking ? "bg-rose-500 text-white shadow-lg" : "bg-black/5 text-slate-400 hover:text-indigo-500")}>
                                {isSpeaking ? <X size={20} /> : <Volume2 size={20} />}
                            </button>
                            <span className="absolute top-10 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] bg-black/5">{isFlipped ? 'Answer' : 'Question'}</span>
                            <div className="flashcard-content no-scrollbar w-full h-full pt-16 pb-12">
                                <h3 className={cn("font-black leading-tight tracking-tight text-balance transition-all", isFlipped ? "text-lg lg:text-2xl" : "text-2xl lg:text-3xl")}>
                                    {isFlipped ? filteredCards[activeCardIndex].answer : filteredCards[activeCardIndex].question}
                                </h3>
                            </div>
                            {!isFlipped && <div className="absolute bottom-10 text-white/30 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]"><RotateCcw size={14} />Tap to reveal</div>}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="w-full flex flex-col gap-6 items-center">
                    {!isFlipped ? (
                        <button onClick={() => setIsFlipped(true)} className="w-full py-7 bg-white text-[#1e3a8a] rounded-[3rem] font-black text-2xl shadow-2xl uppercase tracking-widest active:scale-95 transition-all">Show Answer</button>
                    ) : (
                        <div className="flex justify-center gap-3 w-full animate-in fade-in slide-in-from-bottom-6">
                            {[ { type: 'hard', label: 'Hard', icon: ThumbsDown }, { type: 'good', label: 'Good', icon: CheckCircle }, { type: 'easy', label: 'Easy', icon: ThumbsUp }].map((btn) => (
                                <button key={btn.type} onClick={async () => {
                                        const card = filteredCards[activeCardIndex!];
                                        const updates = { correct_count: btn.type === 'easy' ? (card.correct_count || 0) + 1 : card.correct_count, wrong_count: btn.type === 'hard' ? (card.wrong_count || 0) + 1 : card.wrong_count };
                                        await apiService.updateFlashcard(card.id, updates);
                                        const newCards = [...cards]; const cIdx = newCards.findIndex(c => c.id === card.id); if (cIdx !== -1) newCards[cIdx] = { ...newCards[cIdx], ...updates };
                                        setCards(newCards); nextCard();
                                    }}
                                    className="flex-1 py-6 px-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl bg-[var(--surface)] text-white border border-white/10"
                                >
                                    <btn.icon size={20} />{btn.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeAnalysis && (
            <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col overflow-hidden"
            >
                <div className="px-6 lg:px-12 py-10 bg-[var(--surface)] border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <button onClick={() => setActiveAnalysis(null)} className="p-4 bg-white/5 rounded-3xl text-white hover:bg-white/10 shrink-0"><ChevronLeft size={28} /></button>
                        <div className="truncate"><h3 className="font-black text-white text-xl lg:text-3xl tracking-tighter uppercase italic leading-none mb-1 truncate">{activeAnalysis.originalFileName}</h3><p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">{activeAnalysis.mode} Result</p></div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4 w-full md:w-auto justify-center">
                        <button onClick={() => { window.speechSynthesis.cancel(); navigate('/tutor', { state: { text: activeAnalysis.content, name: activeAnalysis.originalFileName } }); }}
                            className="flex items-center gap-2 p-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all shrink-0"><BrainCircuit size={18} /> Chat Tutor</button>
                        <button onClick={() => { window.speechSynthesis.cancel(); navigate('/quiz', { state: { text: activeAnalysis.content } }); }}
                            className="flex items-center gap-2 p-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all shrink-0"><MessageCircle size={18} /> Start Quiz</button>
                        <div className="w-px h-10 bg-white/10 mx-2 hidden lg:block" />
                        <button onClick={async () => { const newM = !activeAnalysis.mastered; await apiService.updateAnalysis(activeAnalysis.id, { mastered: newM }); const upd = analyses.map(a => a.id === activeAnalysis.id ? { ...a, mastered: newM } : a); setAnalyses(upd); setActiveAnalysis({ ...activeAnalysis, mastered: newM }); }}
                            className={cn("p-4 rounded-2xl transition-all active:scale-90", activeAnalysis.mastered ? "bg-emerald-500 text-white shadow-lg" : "bg-white/5 text-white hover:bg-white/10")}><Star size={20} fill={activeAnalysis.mastered ? "currentColor" : "none"} /></button>
                        <button onClick={() => handleSpeak(activeAnalysis.content)} className={cn("p-4 rounded-2xl transition-all active:scale-90", isSpeaking ? "bg-rose-500 text-white shadow-lg" : "bg-white/5 text-white hover:bg-white/10")}>{isSpeaking ? <X size={20} /> : <Volume2 size={20} />}</button>
                        <button onClick={() => copyAnalysis(activeAnalysis.content)} className="p-4 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all active:scale-90">{copied ? <Check size={20} /> : <Copy size={20} />}</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-12 no-scrollbar">
                    <div className="max-w-5xl mx-auto bg-white/5 rounded-[4rem] border border-white/10 p-12 lg:p-20 shadow-2xl">
                         <div className="text-white font-medium leading-relaxed whitespace-pre-wrap text-2xl lg:text-3xl selection:bg-white selection:text-blue-900 opacity-90">{activeAnalysis.content}</div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmptyState = ({ text }: { text: string }) => (
    <div className="col-span-full py-32 text-center border-4 border-dashed border-white/5 rounded-[4rem]">
        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-white/10"><FileText size={48} /></div>
        <p className="text-white/20 font-black uppercase tracking-[0.4em] text-sm">{text}</p>
    </div>
);

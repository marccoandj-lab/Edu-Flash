
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Plus, 
  Zap, 
  ArrowRight,
  Sparkles,
  Flame,
  X,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  CheckCircle,
  ChevronLeft,
  Check
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { User, Flashcard } from '../types';
import { cn } from '../utils/cn';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { useUser } from '../contexts/UserContext';

export const Dashboard = () => {
  const { user: authUser, profile } = useUser();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [masteryData, setMasteryData] = useState({ total: 0, mastered: 0 });
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showBatchReview, setShowBatchReview] = useState(false);
  const [batchCards, setBatchCards] = useState<Flashcard[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!authUser) return;
      try {
        const userId = authUser.uid;
        const [cardsData, analysesData] = await Promise.all([
          apiService.getFlashcards(userId),
          apiService.getAnalyses(userId)
        ]);
        
        const fetchedCards = (cardsData as Flashcard[]) || [];
        setCards(fetchedCards);

        const masteredCards = fetchedCards.filter((c: Flashcard) => (c.correct_count || 0) > 0).length;
        const masteredAnalyses = analysesData?.filter((a: any) => a.mastered).length || 0;
        const totalItems = fetchedCards.length + (analysesData?.length || 0);
        const totalMastered = masteredCards + masteredAnalyses;
        setMasteryData({ total: totalItems, mastered: totalMastered });

        if (location.state?.showNewBatch && fetchedCards.length > 0) {
            const count = location.state.count || 0;
            const newBatch = fetchedCards.slice(-count);
            setBatchCards(newBatch);
            setShowBatchReview(true);
        }
      } catch (error) {
        console.error("Dashboard error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.state]);

  const handleRate = async (rating: 'hard' | 'good' | 'easy') => {
    if (activeCardIndex === null) return;
    const card = cards[activeCardIndex];
    await apiService.updateFlashcard(card.id, {
      correct_count: rating === 'easy' ? (card.correct_count || 0) + 1 : card.correct_count,
      wrong_count: rating === 'hard' ? (card.wrong_count || 0) + 1 : card.wrong_count,
    });
    if (activeCardIndex < cards.length - 1) {
        setIsFlipped(false);
        setTimeout(() => setActiveCardIndex(activeCardIndex + 1), 300);
    } else {
        setActiveCardIndex(null);
        setIsFlipped(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  const mastered = masteryData.mastered;
  const learning = masteryData.total - mastered;
  const chartData = [
    { name: 'Mastered', value: mastered, color: '#ffffff' },
    { name: 'Learning', value: Math.max(learning, 0), color: 'rgba(255,255,255,0.2)' }
  ];

  const hasCards = cards.length > 0;
  const maxQuota = profile?.plan === 'pro' ? 1000 : 5;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 md:space-y-12 pb-10">
      
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Streak Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 flex items-center gap-6 shadow-2xl relative overflow-hidden"
          >
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-orange-500 rounded-[2rem] flex items-center justify-center shadow-orange-500/50 shadow-2xl shrink-0">
                  <Flame size={28} className="sm:size-10 text-white fill-current" />
              </div>
              <div className="min-w-0">
                  <h3 className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter truncate">{profile?.streak || 0} Days</h3>
                  <p className="text-white/40 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mt-1">Study Streak</p>
              </div>
              <Sparkles size={100} className="absolute -right-4 -top-4 text-white/5 pointer-events-none" />
          </motion.div>
          {/* Stats Grid */}
          <section className="flex-[2] grid grid-cols-2 gap-3 sm:gap-6">
            {[
              { label: 'Cards', value: cards.length || 0, icon: Layers, path: '/library', unit: '' },
              { label: 'Quota', value: profile?.solvesRemaining || 0, icon: Zap, path: '/pricing', unit: ` / ${maxQuota}` },
            ].map((stat: any, i: number) => (
              <Link key={stat.label} to={stat.path} className="block min-w-0">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-[var(--surface)] p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-lg hover:scale-[1.02] transition-all h-full flex flex-col justify-center min-w-0"
                >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 bg-white/10 text-white shrink-0">
                        <stat.icon size={18} className="sm:size-6" strokeWidth={3} />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] truncate">{stat.label}</p>
                    <p className="text-xl sm:text-3xl font-black text-white mt-1 truncate">
                        {stat.value}
                        <span className="text-[10px] sm:text-sm font-bold opacity-30 whitespace-nowrap ml-1">{stat.unit}</span>
                    </p>
                </motion.div>
              </Link>
            ))}
          </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <div className="lg:col-span-8 space-y-6 md:space-y-10">
          {hasCards ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                {/* Resume Card */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#1e40af] rounded-[2.5rem] sm:rounded-[3.5rem] border border-white/10 p-6 sm:p-10 shadow-2xl flex flex-col justify-between"
                >
                    <div className="mb-8">
                        <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-none mb-3 italic">Keep it up!</h3>
                        <p className="text-white/60 font-medium text-xs sm:text-sm leading-relaxed">
                            Complete your daily session to maintain your streak.
                        </p>
                    </div>
                    <Link to="/library" className="w-full py-4 sm:py-5 bg-white text-[#1e3a8a] rounded-[1.5rem] sm:rounded-[2rem] font-black text-xs sm:text-base hover:scale-[1.02] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl whitespace-nowrap">
                        <span>Review Now</span>
                        <ArrowRight size={18} strokeWidth={3} className="shrink-0" />
                    </Link>
                </motion.div>

                {/* Mastery Chart */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                    className="bg-white/5 rounded-[2.5rem] sm:rounded-[3.5rem] border border-white/10 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center"
                >
                    <div className="w-full h-32 sm:h-40 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                                    {chartData.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={_entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                             <span className="text-xl sm:text-2xl font-black text-white">{Math.round((mastered/(masteryData.total || 1))*100)}%</span>
                             <span className="text-[7px] sm:text-[8px] font-bold text-white/30 uppercase tracking-widest">Mastery</span>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-6 flex gap-4 sm:gap-6">
                        <div className="text-left min-w-0">
                            <p className="text-[8px] sm:text-[9px] font-black text-white/30 uppercase tracking-widest">Mastered</p>
                            <p className="text-base sm:text-lg font-black text-white">{mastered}</p>
                        </div>
                        <div className="text-left border-l border-white/10 pl-4 sm:pl-6 min-w-0">
                            <p className="text-[8px] sm:text-[9px] font-black text-white/30 uppercase tracking-widest">Learning</p>
                            <p className="text-base sm:text-lg font-black text-white/60">{learning}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
          ) : (
             <div className="bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10 p-8 sm:p-20 text-center flex flex-col items-center w-full">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mb-6 text-white shrink-0"><Plus size={32} /></div>
                 <h3 className="text-xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">Ready to start?</h3>
                 <p className="text-white/40 mt-3 mb-10 max-w-sm mx-auto text-xs sm:text-sm font-medium leading-relaxed">Scan documents to build your library.</p>
                 <Link to="/upload" className="inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 bg-white text-[#1e3a8a] rounded-[2rem] font-black text-sm sm:text-lg hover:scale-105 shadow-2xl transition-all uppercase tracking-widest text-center whitespace-nowrap">
                    Get Started
                 </Link>
             </div>
          )}
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <Link to="/upload" className="block group">
                <div className="bg-white text-[#1e3a8a] p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl group-hover:scale-[1.02] transition-all relative overflow-hidden">
                    <div className="relative z-10">
                        <Plus size={32} strokeWidth={3} className="mb-3" />
                        <h4 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic leading-none">New Scan</h4>
                        <p className="text-[#1e3a8a] opacity-60 font-bold text-[9px] sm:text-xs uppercase tracking-widest mt-1">Multi-Document AI</p>
                    </div>
                    <Sparkles size={100} className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none" />
                </div>
            </Link>

           <div className="bg-emerald-600 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px] sm:min-h-[250px]">
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 font-black uppercase text-[10px] tracking-widest">Goal</div>
                <h4 className="text-lg sm:text-xl font-black mb-2 uppercase leading-tight">Mastery Goal</h4>
                <p className="text-emerald-100 text-xs sm:text-sm font-bold opacity-80 leading-relaxed italic">
                    Reach 50 mastered cards for your next level.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                  <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min((mastered / 50) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-black tabular-nums">{mastered} / 50</span>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showBatchReview && (
          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-[200] bg-[var(--background)] flex flex-col overflow-hidden"
          >
            <div className="px-4 sm:px-12 py-6 sm:py-8 bg-[var(--surface)] border-b border-white/10 flex items-center justify-between shadow-2xl">
                <div className="min-w-0 pr-4">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase italic truncate">New Batch</h3>
                    <p className="text-white/40 font-bold text-[9px] sm:text-xs uppercase tracking-widest mt-1">Review {batchCards.length} cards</p>
                </div>
                <button onClick={() => setShowBatchReview(false)} className="p-3 sm:p-4 bg-white text-[#1e3a8a] rounded-2xl sm:rounded-3xl shadow-xl shrink-0"><Check size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-12 py-6 sm:py-10 space-y-4 sm:space-y-6 no-scrollbar pb-32">
                {batchCards.map((card: Flashcard, i: number) => (
                    <motion.div key={card.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-[var(--surface)] rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 p-6 sm:p-8 shadow-xl"
                    >
                        <div className="flex flex-col gap-4 sm:gap-8">
                            <div>
                                <span className="text-[8px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1 block">Question</span>
                                <p className="text-base sm:text-xl font-black text-white leading-snug">{card.question}</p>
                            </div>
                            <div className="border-t border-white/5 pt-4">
                                <span className="text-[8px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1 block">Answer</span>
                                <p className="text-base sm:text-xl font-bold text-white/80 leading-relaxed italic">"{card.answer}"</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
                <div className="py-10 text-center"><button onClick={() => setShowBatchReview(false)} className="px-10 py-5 bg-white text-[#1e3a8a] rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl">Done</button></div>
            </div>
          </motion.div>
        )}

        {activeCardIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] bg-[var(--background)] flex flex-col items-center p-4 sm:p-12 overflow-hidden"
          >
            <div className="w-full max-w-xl flex items-center justify-between mb-4 sm:mb-8">
                <button onClick={() => setActiveCardIndex(null)} className="p-3 sm:p-4 bg-[var(--surface)] border border-white/10 rounded-2xl sm:rounded-3xl text-white shadow-xl shrink-0"><ChevronLeft size={20} /></button>
                <div className="text-center text-white min-w-0 px-4">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 truncate">Study Mode</p>
                    <p className="font-black text-sm sm:text-xl">{activeCardIndex + 1} / {cards.length}</p>
                </div>
                <button onClick={() => setActiveCardIndex(null)} className="p-3 sm:p-4 bg-[var(--surface)] border border-white/10 rounded-2xl sm:rounded-3xl text-white shadow-xl shrink-0"><X size={20} /></button>
            </div>
            <div className="w-full max-w-xl flex-1 flex flex-col justify-center min-h-0">
                <div className="perspective-1000 w-full h-[400px] sm:h-[550px] relative mb-6 sm:mb-12">
                    <AnimatePresence mode="wait">
                        <motion.div key={cards[activeCardIndex].id + (isFlipped ? '-back' : '-front')}
                            initial={{ rotateY: isFlipped ? -180 : 180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: isFlipped ? 180 : -180, opacity: 0 }}
                            transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 20 }}
                            onClick={() => setIsFlipped(!isFlipped)}
                            className={cn(
                                "w-full h-full rounded-[3rem] sm:rounded-[4rem] p-8 sm:p-16 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl transition-all relative border-4 min-h-0",
                                isFlipped ? 'bg-white text-[var(--background)] border-white' : 'bg-[var(--surface)] text-white border-white/10'
                            )}
                        >
                            <span className="absolute top-8 sm:top-10 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] bg-black/5">
                                {isFlipped ? 'Answer' : 'Question'}
                            </span>
                            <div className="flashcard-content no-scrollbar w-full h-full pt-12 sm:pt-16 pb-8 sm:pb-12 overflow-y-auto">
                                <h3 className={cn("font-black leading-tight tracking-tight text-balance", isFlipped ? "text-base sm:text-2xl" : "text-lg sm:text-3xl")}>
                                    {isFlipped ? cards[activeCardIndex].answer : cards[activeCardIndex].question}
                                </h3>
                            </div>
                            {!isFlipped && <div className="absolute bottom-8 sm:bottom-12 text-white/30 flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]"><RotateCcw size={12} />Tap to flip</div>}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="w-full flex flex-col gap-4 sm:gap-6 items-center shrink-0">
                    {!isFlipped ? (
                    <button onClick={() => setIsFlipped(true)} className="w-full py-5 sm:py-6 bg-white text-[#1e3a8a] rounded-[2rem] font-black text-sm sm:text-xl shadow-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Show Answer</button>
                    ) : (
                    <div className="flex justify-center gap-2 sm:gap-3 w-full animate-in fade-in slide-in-from-bottom-6 duration-500">
                        {[{ type: 'hard', label: 'Hard', icon: ThumbsDown }, { type: 'good', label: 'Good', icon: CheckCircle }, { type: 'easy', label: 'Easy', icon: ThumbsUp }].map((btn) => (
                            <button key={btn.type} onClick={() => handleRate(btn.type as any)}
                                className="flex-1 py-4 sm:py-6 px-2 sm:px-4 rounded-[1.5rem] sm:rounded-[2rem] font-black text-[8px] sm:text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl bg-[var(--surface)] text-white border border-white/10"
                            >
                                <btn.icon size={16} className={cn(btn.type === 'hard' && "text-rose-400", btn.type === 'good' && "text-white", btn.type === 'easy' && "text-emerald-400")} />
                                {btn.label}
                            </button>
                        ))}
                    </div>
                    )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

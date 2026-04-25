
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { cn } from '../utils/cn';
import { useUser } from '../contexts/UserContext';

export const Quiz = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);

    const { user: authUser } = useUser();
    useEffect(() => {
        const loadQuiz = async () => {
            if (!authUser) return;
            const text = location.state?.text;
            if (!text) {
                navigate('/library');
                return;
            }
            try {
                const userId = authUser.uid;
                const data = await apiService.startQuiz(userId, text);
                setQuestions(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadQuiz();
    }, []);

    const handleAnswer = (option: string) => {
        if (selectedOption) return;
        setSelectedOption(option);
        if (option === questions[currentIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedOption(null);
            } else {
                setIsFinished(true);
            }
        }, 1500);
    };

    if (loading) return (
        <div className="fixed inset-0 bg-[var(--background)] z-[200] flex flex-col items-center justify-center text-center p-10">
            <Loader2 size={64} className="text-white animate-spin mb-8 opacity-50" />
            <h3 className="text-3xl font-black text-white italic tracking-tighter">Generating AI Quiz...</h3>
            <p className="text-white/40 font-bold text-xs uppercase tracking-widest mt-2">Preparing your challenge</p>
        </div>
    );

    if (isFinished) return (
        <div className="fixed inset-0 bg-[var(--background)] z-[200] flex flex-col items-center justify-center text-center p-10">
            <div className="w-32 h-32 bg-white text-[#1e3a8a] rounded-[3.5rem] flex items-center justify-center mb-8 shadow-2xl">
                <Trophy size={64} />
            </div>
            <h3 className="text-4xl font-black text-white italic tracking-tighter mb-2">Quiz Completed!</h3>
            <p className="text-white/60 font-bold text-xl mb-12">Your score: <span className="text-white">{score} / {questions.length}</span></p>
            <button onClick={() => navigate('/library')} className="px-12 py-5 bg-white text-[#1e3a8a] rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Back to Library</button>
        </div>
    );

    const currentQ = questions[currentIndex];

    return (
        <div className="fixed inset-0 bg-[var(--background)] z-[200] flex flex-col overflow-hidden">
            <div className="px-6 lg:px-12 py-8 flex items-center justify-between border-b border-white/10">
                <button onClick={() => navigate('/library')} className="p-4 bg-[var(--surface)] rounded-3xl text-white"><ChevronLeft size={24} /></button>
                <div className="text-center">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Live Quiz</p>
                    <p className="font-black text-white text-xl">{currentIndex + 1} / {questions.length}</p>
                </div>
                <button onClick={() => navigate('/library')} className="p-4 bg-[var(--surface)] rounded-3xl text-white"><X size={24} /></button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-2xl">
                    <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[var(--surface)] rounded-[3.5rem] border border-white/10 p-10 lg:p-14 shadow-2xl mb-10 text-center">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white"><HelpCircle size={24} /></div>
                        <h3 className="text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight">{currentQ.question}</h3>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-4">
                        {currentQ.options.map((option: string) => {
                            const isCorrect = option === currentQ.correctAnswer;
                            const isSelected = selectedOption === option;
                            
                            return (
                                <button 
                                    key={option} 
                                    onClick={() => handleAnswer(option)}
                                    disabled={!!selectedOption}
                                    className={cn(
                                        "w-full p-6 rounded-[2rem] font-bold text-left transition-all border flex items-center justify-between",
                                        !selectedOption ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : 
                                        isSelected ? (isCorrect ? "bg-emerald-500 border-emerald-400 text-white" : "bg-rose-500 border-rose-400 text-white") :
                                        (isCorrect ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-white/5 border-white/5 text-white/20")
                                    )}
                                >
                                    <span>{option}</span>
                                    {selectedOption && isCorrect && <CheckCircle2 size={24} />}
                                    {selectedOption && isSelected && !isCorrect && <AlertCircle size={24} />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

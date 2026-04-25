import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, HelpCircle, ChevronRight, Zap, Camera, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const FAQItem = ({ question, answer }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/5 last:border-none">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className="text-white font-black text-sm lg:text-lg pr-8 tracking-tight">{question}</span>
                <ChevronRight className={cn("text-white/20 transition-transform duration-300 shrink-0", isOpen && "rotate-90 text-white")} size={20} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-8 text-white/50 font-medium leading-relaxed">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const HelpCenter = () => {
    const navigate = useNavigate();
    
    const faqs = [
        {
            question: "How do I create flashcards?",
            answer: "Simply go to the 'Scan' tab, upload your images or documents, and click 'Generate Cards'. Our AI will analyze the text and create interactive Q&A pairs for you."
        },
        {
            question: "What is AI Assistant mode?",
            answer: "The AI Assistant can summarize long lessons or expand on short notes. It's designed to help you understand complex topics better by providing concise summaries or detailed explanations."
        },
        {
            question: "What is the Quota limit?",
            answer: "Free users get 50 AI requests per month. Pro users get 500 requests. One request equals one document or image processed by the AI."
        },
        {
            question: "Can I use the app offline?",
            answer: "Yes! Edu-Flash is a PWA. Once installed on your device, you can view your library and study your existing flashcards without an internet connection."
        }
    ];

    return (
        <div className="px-6 lg:px-10 pb-32 max-w-4xl mx-auto bg-transparent">
            <button onClick={() => navigate(-1)} className="mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl text-white flex items-center gap-2 hover:bg-white/10 transition-all uppercase text-[10px] font-black tracking-widest">
                <ChevronLeft size={16} /> Back
            </button>

            <div className="bg-[var(--surface)] rounded-[3rem] border border-white/10 p-10 lg:p-16 shadow-2xl overflow-hidden relative">
                <div className="flex items-center gap-5 mb-12 relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-white">
                        <HelpCircle size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Help Center</h2>
                        <p className="text-white/40 font-bold text-xs uppercase tracking-widest mt-2">Find answers to common questions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 relative z-10">
                    {[
                        { icon: Camera, label: "Scanning", color: "indigo" },
                        { icon: Book, label: "Library", color: "emerald" },
                        { icon: Zap, label: "Pro Account", color: "amber" },
                    ].map((cat) => (
                        <div key={cat.label} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-white/10 transition-all cursor-pointer">
                            <cat.icon size={24} className={`text-${cat.color}-400`} />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{cat.label}</span>
                        </div>
                    ))}
                </div>

                <div className="relative z-10">
                    <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-4 opacity-30">Frequently Asked Questions</h3>
                    <div className="flex flex-col">
                        {faqs.map((faq, i) => (
                            <FAQItem key={i} {...faq} />
                        ))}
                    </div>
                </div>
                
                <HelpCircle className="absolute -right-20 -bottom-20 w-80 h-80 text-white opacity-[0.02] pointer-events-none" />
            </div>
        </div>
    );
};

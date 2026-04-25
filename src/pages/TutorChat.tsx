
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Send, 
  User, 
  Sparkles,
  Loader2,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { ChatMessage } from '../types';
import { cn } from '../utils/cn';
import { MathRenderer } from '../components/MathRenderer';
import 'katex/dist/katex.min.css';

export const TutorChat = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const context = location.state?.text;
    const fileName = location.state?.name || "Document";

    useEffect(() => {
        if (!context) navigate('/library');
        
        // Welcome message
        setMessages([{
            role: 'assistant',
            content: `Hello! I'm your AI Tutor for "${fileName}". How can I help you understand this material better?`,
            timestamp: new Date().toISOString()
        }]);
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const userId = 'user123';
            const response = await apiService.chatWithTutor(userId, input, context, messages);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            }]);
        } catch (err: any) {
            alert(err.message || "Chat failed.");
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[var(--background)] z-[200] flex flex-col overflow-hidden">
            <div className="px-6 lg:px-12 py-8 flex items-center justify-between border-b border-white/10 bg-[var(--surface)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/library')} className="p-3 bg-white/5 rounded-2xl text-white hover:bg-white/10 transition-all"><ChevronLeft size={24} /></button>
                    <div>
                        <h3 className="text-xl font-black text-white leading-none mb-1">AI Tutor</h3>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest truncate max-w-[150px]">{fileName}</p>
                    </div>
                </div>
                <button onClick={() => navigate('/library')} className="p-3 bg-white/5 rounded-2xl text-white"><X size={20} /></button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 space-y-6 no-scrollbar">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex w-full",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "max-w-[85%] p-6 rounded-[2.5rem] shadow-xl relative",
                                msg.role === 'user' ? "bg-white text-[#1e3a8a] rounded-tr-sm" : "bg-[var(--surface)] text-white border border-white/10 rounded-tl-sm"
                            )}>
                                <div className="flex items-center gap-2 mb-2 opacity-40">
                                    {msg.role === 'assistant' ? <Sparkles size={12} /> : <User size={12} />}
                                    <span className="text-[8px] font-black uppercase tracking-widest">{msg.role}</span>
                                </div>
                                <div className="text-sm font-bold leading-relaxed">
                                    {msg.role === 'assistant' ? (
                                        <MathRenderer text={msg.content} />
                                    ) : (
                                        <p>{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-[var(--surface)] p-6 rounded-[2.5rem] border border-white/10 flex items-center gap-3">
                            <Loader2 size={16} className="animate-spin text-indigo-400" />
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Tutor is thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 lg:p-12 bg-[var(--surface)] border-t border-white/10">
                <div className="max-w-4xl mx-auto relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask your tutor anything about the document..."
                        className="w-full pl-8 pr-20 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20 shadow-inner"
                    />
                    <button onClick={handleSend} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white text-[#1e3a8a] rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
                        <Send size={24} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

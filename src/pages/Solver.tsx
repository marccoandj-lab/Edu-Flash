
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  Camera, 
  X, 
  RefreshCw,
  ArrowRight,
  BrainCircuit,
  Bookmark,
  Trash2,
  Upload as UploadIcon
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import imageCompression from 'browser-image-compression';
import { apiService } from '../services/apiService';
import { cn } from '../utils/cn';
import { MathRenderer } from '../components/MathRenderer';
import 'katex/dist/katex.min.css';

interface SolvedProblem {
    id: string;
    problem: string;
    solution: string;
    category: 'Math' | 'Physics' | 'Chemistry';
    createdAt: string;
}

export const Solver = () => {
  const [tab, setTab] = useState<'solver' | 'vault'>('solver');
  const [subject, setSubject] = useState<'Math' | 'Physics' | 'Chemistry'>('Math');
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isProcessing, setIsProcessing] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [vault, setVault] = useState<SolvedProblem[]>([]);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const saved = localStorage.getItem('edu_solver_vault');
    if (saved) setVault(JSON.parse(saved));
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
    const compressed = await imageCompression(file, options);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(compressed);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });

  const handleSolve = async () => {
    if (!input && !preview) return;
    setIsProcessing(true);
    try {
        const userId = 'user123';
        const result = await apiService.solveProblemWithAI(userId, input, preview || undefined);
        setSolution(result);
        
        const newSolved: SolvedProblem = {
            id: Math.random().toString(36).substr(2, 9),
            problem: input || "Image-based problem",
            solution: result,
            category: subject,
            createdAt: new Date().toISOString()
        };
        const newVault = [newSolved, ...vault];
        setVault(newVault);
        localStorage.setItem('edu_solver_vault', JSON.stringify(newVault));
    } catch (err: any) {
        alert(err.message || "Failed to solve.");
    } finally {
        setIsProcessing(false);
    }
  };

  const deleteFromVault = (id: string) => {
      const newVault = vault.filter(v => v.id !== id);
      setVault(newVault);
      localStorage.setItem('edu_solver_vault', JSON.stringify(newVault));
  };

  return (
    <div className="px-6 lg:px-10 pb-32 max-w-5xl mx-auto bg-transparent">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Solver Hub</h2>
            <p className="text-white/40 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">Advanced Problem Solving</p>
        </div>
        <div className="flex p-1.5 bg-white/5 rounded-[2rem] border border-white/10 shadow-2xl">
            <button onClick={() => setTab('solver')} className={cn("px-6 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all", tab === 'solver' ? "bg-white text-[#1e3a8a] shadow-xl" : "text-white/40 hover:text-white")}>Solver</button>
            <button onClick={() => setTab('vault')} className={cn("px-6 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all", tab === 'vault' ? "bg-white text-[#1e3a8a] shadow-xl" : "text-white/40 hover:text-white")}>Vault</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'solver' ? (
          <motion.div key="solver" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            {!solution ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-8">
                   <div className="flex gap-2 overflow-x-auto no-scrollbar">
                       {['Math', 'Physics', 'Chemistry'].map((s: any) => (
                           <button key={s} onClick={() => setSubject(s)} className={cn("px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all whitespace-nowrap", subject === s ? "bg-white text-[#1e3a8a] border-white" : "bg-white/5 text-white/40 border-white/10")}>{s}</button>
                       ))}
                   </div>
                   
                   <div className="bg-white/5 rounded-[3rem] border border-white/10 p-8 shadow-2xl">
                       <textarea 
                        value={input} onChange={(e) => setInput(e.target.value)}
                        placeholder={`Describe your ${subject} problem...`}
                        className="w-full bg-transparent border-none text-white font-bold placeholder:text-white/10 focus:outline-none min-h-[150px] resize-none text-lg"
                       />
                       <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsCapturing(true)} className="flex items-center gap-2 text-white/60 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"><Camera size={20} /> Scan</button>
                                <div {...getRootProps()}><input {...getInputProps()} /><button className="flex items-center gap-2 text-white/60 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"><UploadIcon size={20} /> Gallery</button></div>
                            </div>
                            <button onClick={handleSolve} disabled={isProcessing || (!input && !preview)} className="flex-1 sm:flex-none px-10 py-4 bg-white text-[#1e3a8a] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-30">
                                {isProcessing ? "Analyzing..." : "Solve"}
                            </button>
                       </div>
                   </div>

                   {preview && (
                       <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl">
                           <img src={preview} className="w-full h-auto" />
                           <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-xl"><X size={18} /></button>
                       </div>
                   )}
                </div>
                
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white/5 rounded-[3rem] border border-white/10 p-8 h-full flex flex-col justify-center text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-white shadow-xl"><BrainCircuit size={32} /></div>
                        <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic mb-4">Reasoning Engine</h4>
                        <p className="text-white/40 text-sm font-medium leading-relaxed">
                            Solutions are verified using advanced logical distillation for maximum accuracy.
                        </p>
                    </div>
                </div>
              </div>
            ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--surface)] rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden">
                    <div className="px-8 py-8 bg-white/5 border-b border-white/10 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3 text-white"><Calculator size={20} /><h4 className="font-black text-sm uppercase tracking-widest italic">Solution Path</h4></div>
                        <button onClick={() => setSolution(null)} className="p-4 bg-white/10 rounded-2xl text-white"><X size={20} /></button>
                    </div>
                    <div className="p-8 sm:p-12 lg:p-16 overflow-x-auto no-scrollbar">
                        <div className="text-white font-medium text-lg lg:text-xl selection:bg-white selection:text-blue-900">
                            <MathRenderer text={solution} />
                        </div>
                    </div>
                    <div className="p-10 bg-white/5 border-t border-white/10 text-center">
                        <button onClick={() => setSolution(null)} className="px-12 py-5 bg-white text-[#1e3a8a] rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">New Problem</button>
                    </div>
                </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div key="vault" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {vault.length > 0 ? vault.map((item) => (
                  <div key={item.id} className="bg-[var(--surface)] p-8 rounded-[3rem] border border-white/10 shadow-2xl relative group">
                      <button onClick={() => deleteFromVault(item.id)} className="absolute top-6 right-6 p-2 text-white/10 hover:text-rose-500 transition-colors z-10"><Trash2 size={18} /></button>
                      <div className="flex items-center gap-3 mb-4"><Bookmark size={14} className="text-white/30" /><span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.category}</span></div>
                      <p className="text-white font-black text-lg line-clamp-2 pr-8 mb-6 uppercase tracking-tight italic">"{item.problem}"</p>
                      <button onClick={() => { setSolution(item.solution); setTab('solver'); }} className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest hover:text-indigo-400 transition-colors">View Solution <ArrowRight size={14} /></button>
                  </div>
              )) : (
                <div className="col-span-full py-32 text-center border-4 border-dashed border-white/5 rounded-[4rem]">
                    <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-white/10"><Calculator size={40} /></div>
                    <p className="text-white/20 font-black uppercase tracking-[0.4em] text-sm">Vault is empty</p>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
          {isCapturing && (
            <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center lg:relative lg:inset-auto lg:rounded-[3.5rem] lg:overflow-hidden lg:h-[600px] lg:max-w-2xl lg:mx-auto mt-10 shadow-2xl ring-4 ring-white/10">
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" videoConstraints={{ facingMode }} />
                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6 px-6">
                    <button onClick={() => setIsCapturing(false)} className="w-14 h-14 bg-white/10 backdrop-blur-xl text-white rounded-full flex items-center justify-center"><X size={24} /></button>
                    <button onClick={() => { const s = webcamRef.current?.getScreenshot(); setPreview(s || null); setIsCapturing(false); }} className="w-20 h-20 bg-white text-[#1e3a8a] rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all"><div className="w-14 h-14 rounded-full border-2 border-[#1e3a8a]" /></button>
                    <button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} className="w-14 h-14 bg-white/10 backdrop-blur-xl text-white rounded-full flex items-center justify-center"><RefreshCw size={24} /></button>
                </div>
            </div>
          )}
      </AnimatePresence>
    </div>
  );
};

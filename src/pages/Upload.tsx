
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload as UploadIcon, 
  Camera, 
  X, 
  Loader2, 
  AlertCircle,
  FileText,
  RefreshCw,
  Layers,
  Check
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import imageCompression from 'browser-image-compression';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useUser } from '../contexts/UserContext';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface QueueItem {
    id: string;
    type: 'image' | 'text';
    data: string;
    name: string;
}

export const Upload = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
  };

  const extractTextFromWord = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    const newItems: QueueItem[] = [];

    for (const file of acceptedFiles) {
        try {
            if (file.type.startsWith('image/')) {
                const options = { maxSizeMB: 0.4, maxWidthOrHeight: 1024, useWebWorker: true };
                const compressedFile = await imageCompression(file, options);
                const reader = new FileReader();
                const base64 = await new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(compressedFile);
                });
                newItems.push({ id: Math.random().toString(36), type: 'image', data: base64, name: file.name });
            } else if (file.type === 'text/plain') {
                const text = await file.text();
                newItems.push({ id: Math.random().toString(36), type: 'text', data: text, name: file.name });
            } else if (file.type === 'application/pdf') {
                const text = await extractTextFromPdf(file);
                newItems.push({ id: Math.random().toString(36), type: 'text', data: text, name: file.name });
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
                const text = await extractTextFromWord(file);
                newItems.push({ id: Math.random().toString(36), type: 'text', data: text, name: file.name });
            }
        } catch (err) {
            console.error("File skip:", file.name, err);
            setError(`Failed to process ${file.name}`);
        }
    }
    setQueue(prev => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 
        'image/*': [], 
        'text/plain': ['.txt'],
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/msword': ['.doc']
    },
    multiple: true 
  });

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const newItem: QueueItem = {
          id: Math.random().toString(36),
          type: 'image',
          data: imageSrc,
          name: `Camera Scan ${queue.length + 1}.jpg`
      };
      setQueue(prev => [...prev, newItem]);
    }
  }, [webcamRef, queue.length]);

  const removeItem = (id: string) => {
      setQueue(prev => prev.filter(item => item.id !== id));
  };

  const { user: authUser } = useUser();
  const handleProcess = async () => {
    if (queue.length === 0 || !authUser) return;
    setIsProcessing(true);
    setError(null);
    let totalNewCards = 0;

    try {
      const userId = authUser.uid;
      for (let i = 0; i < queue.length; i++) {
          setProcessingIndex(i);
          const item = queue[i];
          const cardsCreated = await apiService.createFlashcards(userId, {
              imageBase64: item.type === 'image' ? item.data : undefined,
              text: item.type === 'text' ? item.data : undefined
          });
          totalNewCards += cardsCreated;
      }
      navigate('/', { state: { showNewBatch: true, count: totalNewCards } });
    } catch (err: any) {
      setError(err.message || "Batch processing failed.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="px-6 lg:px-10 pb-32 bg-transparent">
      <div className="mb-10 text-center lg:text-left flex items-center justify-between">
        <div>
            <h2 className="text-xl lg:text-2xl font-black text-white leading-none mb-2 uppercase">Multi-Scan</h2>
            <p className="text-white/60 font-bold text-xs uppercase tracking-widest">Process multiple items at once</p>
        </div>
        {queue.length > 0 && !isProcessing && !isCapturing && (
            <button 
                onClick={handleProcess}
                className="bg-white text-[#1e3a8a] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
                Process All ({queue.length})
            </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {!isProcessing && !isCapturing && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div {...getRootProps()} className={cn(
                        "border-2 border-dashed rounded-[3rem] p-12 flex flex-col items-center justify-center cursor-pointer transition-all h-64",
                        isDragActive ? "border-white bg-white/10" : "border-white/10 bg-white/5 hover:border-white/30"
                    )}>
                        <input {...getInputProps()} />
                        <UploadIcon size={32} className="text-white/60 mb-4" />
                        <p className="text-white font-black text-sm uppercase tracking-widest">Add Files</p>
                        <p className="text-white/30 text-[10px] mt-2 font-bold uppercase tracking-widest italic">PDF, TXT, IMAGE</p>
                    </div>
                    <button onClick={() => setIsCapturing(true)} className="w-full py-6 bg-white/5 border-2 border-white/10 rounded-[2.5rem] flex items-center justify-center gap-3 text-white/80 hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest">
                        <Camera size={20} />
                        Open Camera
                    </button>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] px-4">Processing Queue ({queue.length})</h3>
                    <div className="bg-white/5 rounded-[3rem] border border-white/10 p-5 min-h-[300px] max-h-[400px] overflow-y-auto no-scrollbar space-y-3">
                        <AnimatePresence mode="popLayout">
                            {queue.length > 0 ? queue.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white/10 p-4 rounded-2xl border border-white/5 flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4 truncate">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--background)] flex-shrink-0 flex items-center justify-center border border-white/10 shadow-inner">
                                            {item.type === 'image' ? <img src={item.data} className="w-full h-full object-cover" /> : <FileText className="text-white" />}
                                        </div>
                                        <p className="text-xs font-bold text-white truncate pr-4">{item.name}</p>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="p-2 text-white/30 hover:text-white transition-colors">
                                        <X size={18} />
                                    </button>
                                </motion.div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20 text-white">
                                    <Layers size={48} className="mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest">Empty Queue</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        )}

        {isCapturing && (
          <div className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center lg:relative lg:inset-auto lg:rounded-[3.5rem] lg:overflow-hidden lg:h-[600px] lg:max-w-2xl lg:mx-auto transition-all">
            <div className="relative w-full h-full lg:rounded-[3rem] overflow-hidden">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{ facingMode: facingMode }}
                />
                
                {/* Scanning Frame Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12">
                    <div className="w-full h-full border-2 border-white/30 rounded-3xl relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
                    </div>
                </div>

                {/* HUD */}
                <div className="absolute top-safe pt-8 lg:top-8 left-0 right-0 flex justify-center">
                    <div className="px-6 py-2 bg-black/40 backdrop-blur-2xl rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] border border-white/10 shadow-2xl">
                        Snapshots in session: {queue.length}
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-safe pb-12 lg:bottom-10 left-0 right-0 flex items-center justify-center gap-10 px-8">
                    <button 
                        onClick={() => setIsCapturing(false)} 
                        className="w-16 h-16 bg-white/10 backdrop-blur-xl text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
                    >
                        <Check size={28} strokeWidth={3} />
                    </button>
                    
                    <button 
                        onClick={capture} 
                        className="w-24 h-24 bg-white text-[var(--background)] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-90 transition-all border-[6px] border-white/20"
                    >
                        <div className="w-16 h-16 rounded-full border-4 border-[var(--background)]" />
                    </button>

                    <button 
                        onClick={toggleCamera} 
                        className="w-16 h-16 bg-white/10 backdrop-blur-xl text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
                    >
                        <RefreshCw size={28} strokeWidth={3} />
                    </button>
                </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-10 bg-white/5 rounded-[4rem] border border-white/10 shadow-sm relative overflow-hidden max-w-2xl mx-auto">
            <div className="absolute top-0 left-0 w-full h-2 bg-white/5">
                <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: `${(processingIndex / queue.length) * 100}%` }}
                    className="w-full h-full bg-white shadow-[0_0_30px_white]"
                />
            </div>
            <div className="relative">
              <div className="w-40 h-40 border-4 border-white/10 rounded-[4rem] animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={64} className="text-white animate-spin" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-[#1e3a8a] px-5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
                  {processingIndex + 1} / {queue.length}
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight italic">AI is Analyzing...</h3>
              <p className="text-white/40 font-bold text-xs uppercase tracking-[0.3em] mt-3 truncate max-w-xs mx-auto">"{queue[processingIndex]?.name || 'Item'}"</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-10 bg-rose-500/20 border border-rose-500/30 rounded-[3rem] flex items-start gap-6 text-white max-w-2xl mx-auto">
            <AlertCircle className="shrink-0 mt-1" size={32} />
            <div>
                <p className="font-black text-sm uppercase tracking-widest mb-1 text-rose-300 tracking-tighter">Attention</p>
                <p className="text-lg font-bold leading-snug">{error}</p>
                <button onClick={() => {setError(null); setIsProcessing(false);}} className="mt-6 px-8 py-3 bg-white text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

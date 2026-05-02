import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion } from 'framer-motion';
import 'katex/dist/katex.min.css';
import { cn } from '../utils/cn';

interface MathRendererProps {
  text: string;
}

export const MathRenderer = ({ text }: MathRendererProps) => {
  // Pre-process common formatting artifacts
  // Pre-process to ensure valid LaTeX blocks
  const processedText = text
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$')
    // Fix common OCR errors
    .replace(/d\s+ot/g, '\\cdot')
    .replace(/t\s+imes/g, '\\times');

  const sections = processedText.split(/(?=##\s+)/g);

  return (
    <div className="math-renderer-premium space-y-12">
      {sections.map((section, idx) => {
        const isHeaderSection = section.trim().startsWith('##');
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
            className={cn(
              "math-step relative p-8 sm:p-10 rounded-[2.5rem] border transition-all duration-500 overflow-hidden",
              isHeaderSection 
                ? "bg-white/[0.05] border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-white/20" 
                : "bg-transparent border-transparent"
            )}
          >
            {/* Subtle light effect for premium feel */}
            {isHeaderSection && (
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />
            )}

            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-2xl sm:text-3xl font-black mb-8 text-white uppercase tracking-tight flex items-center gap-5">
                    <div className="relative">
                        <span className="block w-2 h-10 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-full" />
                        <span className="absolute inset-0 blur-md bg-blue-400/50 rounded-full" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        {children}
                    </span>
                  </h2>
                ),
                p: ({ children }) => (
                  <p className="text-white/80 leading-relaxed text-lg sm:text-xl font-medium mb-6 last:mb-0">
                    {children}
                  </p>
                ),
                div: ({ className, children }) => {
                  if (className?.includes('math-display')) {
                    return (
                      <div className="my-10 py-10 px-6 overflow-x-auto no-scrollbar bg-black/40 rounded-[2rem] border border-white/5 shadow-inner relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
                        <div className="text-2xl sm:text-3xl text-center text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                          {children}
                        </div>
                      </div>
                    );
                  }
                  return <div className={className}>{children}</div>;
                }
              }}
            >
              {section}
            </ReactMarkdown>
          </motion.div>
        );
      })}
    </div>
  );
};

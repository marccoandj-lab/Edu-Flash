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
    <div className="math-renderer-clean space-y-8">
      {sections.map((section, idx) => {
        const isHeaderSection = section.trim().startsWith('##');
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "math-step p-6 rounded-3xl border transition-all duration-300",
              isHeaderSection 
                ? "bg-white/[0.04] border-white/10 shadow-xl" 
                : "bg-transparent border-transparent"
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-2xl font-black mb-6 text-white uppercase tracking-wider flex items-center gap-4">
                    <span className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    {children}
                  </h2>
                ),
                p: ({ children }) => (
                  <p className="text-white/90 leading-relaxed text-lg mb-4 last:mb-0">
                    {children}
                  </p>
                ),
                div: ({ className, children }) => {
                  if (className?.includes('math-display')) {
                    return (
                      <div className="my-8 py-6 px-4 overflow-x-auto no-scrollbar bg-black/40 rounded-2xl border border-white/10 shadow-inner group">
                        <div className="text-xl sm:text-2xl text-center text-blue-100">
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

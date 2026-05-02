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
  const processedText = text
    .replace(/d\s+ot/g, 'cdot')
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$');

  const sections = processedText.split(/(?=##\s+)/g);

  return (
    <div className="math-renderer-clean space-y-6">
      {sections.map((section, idx) => {
        const isHeaderSection = section.trim().startsWith('##');
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "math-step p-5 rounded-2xl border transition-colors",
              isHeaderSection 
                ? "bg-white/[0.03] border-white/10" 
                : "bg-transparent border-transparent"
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-xl font-black mb-4 text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full" />
                    {children}
                  </h2>
                ),
                p: ({ children }) => (
                  <p className="text-white/80 leading-relaxed text-base mb-4 last:mb-0">
                    {children}
                  </p>
                ),
                // Fix overlaps: Use horizontal scrolling and remove scaling
                div: ({ className, children }) => {
                  if (className?.includes('math-display')) {
                    return (
                      <div className="my-6 py-4 overflow-x-auto no-scrollbar bg-black/30 rounded-xl border border-white/5">
                        <div className="px-6 text-lg sm:text-xl text-center min-w-max">
                          {children}
                        </div>
                      </div>
                    );
                  }
                  return <div className={className}>{children}</div>;
                },
                span: ({ className, children }) => {
                  if (className?.includes('math-inline')) {
                    return <span className="inline-block mx-0.5 text-white font-semibold">{children}</span>;
                  }
                  return <span className={className}>{children}</span>;
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

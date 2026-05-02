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
  // Step 1: Pre-process text to ensure consistent delimiters for ReactMarkdown
  // Also fix common AI formatting artifacts like "d ot" or missing backslashes
  const processedText = text
    .replace(/d\s+ot/g, 'cdot')
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$');

  // Step 2: Split into sections based on ## headers to apply card styling
  const sections = processedText.split(/(?=##\s+)/g);

  return (
    <div className="math-renderer-modern space-y-8">
      {sections.map((section, idx) => {
        const isHeaderSection = section.trim().startsWith('##');
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className={cn(
              "math-section group transition-all duration-300",
              isHeaderSection 
                ? "bg-white/[0.03] backdrop-blur-sm border border-white/10 p-8 rounded-[2.5rem] shadow-2xl hover:bg-white/[0.05] hover:border-white/20" 
                : "px-4"
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-2xl sm:text-3xl font-black mb-8 flex items-center gap-4 text-white italic tracking-tighter uppercase">
                    <span className="w-1.5 h-10 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-full" />
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold mb-4 text-white/90 flex items-center gap-3">
                    <span className="w-1 h-6 bg-white/20 rounded-full" />
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-white/70 leading-relaxed text-lg mb-4 last:mb-0 font-medium">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-3 mb-6 ml-4">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="flex gap-3 text-white/70 text-lg">
                    <span className="text-blue-400 mt-1.5">•</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-black text-white bg-white/5 px-1.5 py-0.5 rounded-md">
                    {children}
                  </strong>
                ),
                // Custom math blocks styling
                div: ({ className, children }) => {
                  if (className?.includes('math-display')) {
                    return (
                      <div className="my-10 py-6 px-4 bg-white/[0.02] border-y border-white/5 overflow-x-auto no-scrollbar text-center scale-110 sm:scale-125 transition-transform origin-center hover:scale-130">
                        {children}
                      </div>
                    );
                  }
                  return <div className={className}>{children}</div>;
                },
                span: ({ className, children }) => {
                  if (className?.includes('math-inline')) {
                    return <span className="inline-block mx-1 text-white font-bold">{children}</span>;
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

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { motion } from 'framer-motion';
import 'katex/dist/katex.min.css';
import { cn } from '../utils/cn';

interface MathRendererProps {
  text: string;
}

export const MathRenderer = ({ text }: MathRendererProps) => {
  const processContent = (content: string) => {
    // Step 1: Normalize all possible LaTeX delimiters to standard $$ (block) and $ (inline)
    let normalized = content
      .replace(/\\\[/g, '$$$$')
      .replace(/\\\]/g, '$$$$')
      .replace(/\\\(/g, '$')
      .replace(/\\\)/g, '$');

    // Split by sections starting with ## (AI structured headers)
    const sections = normalized.split(/(?=##\s+)/g);

    return sections.map((section, sectionIdx) => {
      const isHeader = section.trim().startsWith('##');
      
      // Split section into block math and text/inline math
      const blocks = section.split(/(\$\$.*?\$\$)/gs);

      return (
        <motion.div 
          key={sectionIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIdx * 0.1 }}
          className={cn(
            "section-container mb-8 last:mb-0",
            isHeader ? "bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-sm" : ""
          )}
        >
          {blocks.map((block, i) => {
            if (block.startsWith('$$') && block.endsWith('$$')) {
              const math = block.slice(2, -2).trim();
              if (!math) return null;
              return (
                <div key={i} className="my-8 overflow-x-auto no-scrollbar py-2 text-center scale-110 lg:scale-125 origin-center">
                  <BlockMath math={math} />
                </div>
              );
            }

            // Handle inline math $...$ and text
            const inlines = block.split(/(\$.*?\$)/g);
            return (
              <div key={i} className="inline-content leading-relaxed text-lg">
                {inlines.map((part, j) => {
                  if (part.startsWith('$') && part.endsWith('$')) {
                    const math = part.slice(1, -1).trim();
                    if (!math) return null;
                    return <InlineMath key={j} math={math} />;
                  }

                  // Handle headers and bold text
                  return part.split('\n').map((line, k) => {
                    const cleanLine = line.trim();
                    if (!cleanLine) return k > 0 ? <br key={k} /> : null;

                    // Header check
                    if (cleanLine.startsWith('##')) {
                      return (
                        <h3 
                          key={k} 
                          className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-3 text-white italic tracking-tight"
                        >
                          <span className="w-2 h-8 bg-white rounded-full" />
                          {cleanLine.replace(/^##\s*/, '')}
                        </h3>
                      );
                    }

                    // Bold check
                    const boldParts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <span key={k} className="block mb-2 last:mb-0">
                        {boldParts.map((bp, bpi) => {
                          if (bp.startsWith('**') && bp.endsWith('**')) {
                            return (
                              <strong key={bpi} className="font-black text-white px-1">
                                {bp.slice(2, -2)}
                              </strong>
                            );
                          }
                          return bp;
                        })}
                      </span>
                    );
                  });
                })}
              </div>
            );
          })}
        </motion.div>
      );
    });
  };

  return (
    <div className="math-renderer-enhanced space-y-6">
      {processContent(text)}
    </div>
  );
};

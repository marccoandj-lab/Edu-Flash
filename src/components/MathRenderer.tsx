import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { cn } from '../utils/cn';

interface MathRendererProps {
  text: string;
}

export const MathRenderer = ({ text }: MathRendererProps) => {
  const processContent = (content: string) => {
    // Step 1: Normalize delimiters - turn \[ \] and $$ $$ into a single format, and \( \) and $ into another
    let normalized = content
      .replace(/\\\[/g, '$$$$')
      .replace(/\\\]/g, '$$$$')
      .replace(/\\\(/g, '$')
      .replace(/\\\)/g, '$');

    // Split by block math $$...$$
    const blocks = normalized.split(/(\$\$.*?\$\$)/gs);

    return blocks.map((block, i) => {
      if (block.startsWith('$$') && block.endsWith('$$')) {
        const math = block.slice(2, -2).trim();
        return (
          <div key={i} className="my-6 overflow-x-auto selection:bg-white/20">
            <BlockMath math={math} />
          </div>
        );
      }

      // Handle inline math $...$ and text
      const inlines = block.split(/(\$.*?\$)/g);
      return (
        <div key={i} className="inline-content leading-relaxed">
          {inlines.map((part, j) => {
            if (part.startsWith('$') && part.endsWith('$')) {
              return <InlineMath key={j} math={part.slice(1, -1)} />;
            }

            // Handle headings, bold, and lines
            return part.split('\n').map((line, k) => {
              // Bold check
              const boldParts = line.split(/(\*\*.*?\*\*)/g);
              const renderedLine = boldParts.map((bp, bpi) => {
                if (bp.startsWith('**') && bp.endsWith('**')) {
                  return (
                    <strong key={bpi} className="font-black text-white">
                      {bp.slice(2, -2)}
                    </strong>
                  );
                }
                return bp;
              });

              return (
                <span
                  key={`${i}-${j}-${k}`}
                  className={cn(
                    "inline",
                    line.startsWith('##')
                      ? "block text-xl sm:text-2xl font-black mt-8 mb-4 border-b border-white/10 pb-2 text-white italic"
                      : ""
                  )}
                >
                  {line.startsWith('##') ? renderedLine.slice(1) : renderedLine}
                  {k < part.split('\n').length - 1 && <br />}
                </span>
              );
            });
          })}
        </div>
      );
    });
  };

  return (
    <div className="math-rendered-content space-y-4 text-white/80">
      {processContent(text)}
    </div>
  );
};

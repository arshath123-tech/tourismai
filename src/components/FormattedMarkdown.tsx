import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content by lines
  const lines = content.split('\n');

  // Helper to parse inline **bold text** inside any line
  const parseInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        const cleanText = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold text-slate-950">
            {cleanText}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-1.5 text-slate-900 ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        // Check if the whole line is a main header (e.g. **📍 Headline** or === HEADER === or ### Header)
        const isHeaderLine =
          (trimmed.startsWith('**') && trimmed.endsWith('**')) ||
          trimmed.startsWith('###') ||
          trimmed.startsWith('===');

        if (isHeaderLine) {
          // Strip out ** or ### or ===
          let cleanHeader = trimmed
            .replace(/^\*\*/, '')
            .replace(/\*\*$/, '')
            .replace(/^###\s*/, '')
            .replace(/^===\s*/, '')
            .replace(/\s*===$/, '')
            .trim();

          return (
            <div
              key={lineIdx}
              className="font-extrabold text-slate-950 text-sm sm:text-base pt-2.5 pb-1 border-b border-slate-300 tracking-tight flex items-center gap-2"
            >
              {cleanHeader}
            </div>
          );
        }

        // Bullet points / Subpoints
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const bulletText = trimmed.replace(/^[-•]\s*/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5 text-slate-900">
              <span className="text-indigo-600 font-bold select-none">•</span>
              <span className="flex-1 text-slate-900 font-normal">{parseInlineBold(bulletText)}</span>
            </div>
          );
        }

        // Regular paragraph line with inline bold support
        return (
          <p key={lineIdx} className="my-0.5 text-slate-900">
            {parseInlineBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
};


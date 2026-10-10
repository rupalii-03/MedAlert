import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: 'cyan' | 'magenta' | 'green' | 'amber' | 'neutral';
  cornerBrackets?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  accent = 'cyan',
  cornerBrackets = false,
  onClick,
}) => {
  const borderStyles: Record<NonNullable<CardProps['accent']>, string> = {
    cyan: 'border-[#00F0FF]/25 hover:border-[#00F0FF]/60 hover:shadow-[0_0_28px_-6px_rgba(0,240,255,0.22)]',
    magenta: 'border-[#FF2BD6]/25 hover:border-[#FF2BD6]/60 hover:shadow-[0_0_28px_-6px_rgba(255,43,214,0.22)]',
    green: 'border-[#00FF85]/30 hover:border-[#00FF85]/70 hover:shadow-[0_0_28px_-6px_rgba(0,255,133,0.22)]',
    amber: 'border-[#FFD60A]/30 hover:border-[#FFD60A]/70 hover:shadow-[0_0_28px_-6px_rgba(255,214,10,0.2)]',
    neutral: 'border-slate-800/80 hover:border-slate-700',
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl bg-[#0D1238]/75 backdrop-blur-md border transition-all duration-200 ${borderStyles[accent]} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {cornerBrackets && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-[#00F0FF]/70 rounded-tl-sm"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-[#00F0FF]/70 rounded-tr-sm"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-[#00F0FF]/70 rounded-bl-sm"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#00F0FF]/70 rounded-br-sm"
          />
        </>
      )}
      {children}
    </div>
  );
};

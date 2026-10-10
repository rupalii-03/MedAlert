import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FlowStepProps {
  stepNumber: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export const FlowStep: React.FC<FlowStepProps> = ({
  stepNumber,
  title,
  description,
  Icon,
  isActive,
  isCompleted,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative text-left rounded-xl p-5 border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] ${
        isActive
          ? 'bg-[#10194A]/95 border-[#00F0FF] shadow-[0_0_30px_-6px_rgba(0,240,255,0.35)]'
          : isCompleted
          ? 'bg-[#0D1238]/80 border-[#00FF85]/45 hover:border-[#00FF85]'
          : 'bg-[#0B0F2F]/70 border-slate-800/90 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span
          className={`font-mono-tabular text-xs font-semibold tracking-wider ${
            isActive
              ? 'text-[#00F0FF]'
              : isCompleted
              ? 'text-[#00FF85]'
              : 'text-slate-400'
          }`}
        >
          STEP {stepNumber}
        </span>

        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
            isActive
              ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
              : isCompleted
              ? 'bg-[#00FF85]/15 border-[#00FF85]/60 text-[#00FF85]'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 group-hover:text-slate-200'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <h3
        className={`text-base font-semibold transition-colors ${
          isActive ? 'text-[#00F0FF]' : 'text-white'
        }`}
      >
        {title}
      </h3>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
        {description}
      </p>

      {/* Bottom active progress indicator bar */}
      <div className="mt-4 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isActive
              ? 'w-full bg-[#00F0FF]'
              : isCompleted
              ? 'w-full bg-[#00FF85]'
              : 'w-0 bg-transparent'
          }`}
        />
      </div>
    </button>
  );
};

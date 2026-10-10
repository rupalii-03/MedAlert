import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const FAQItem: React.FC<FAQItemProps> = ({
  id,
  question,
  answer,
  isOpen,
  onToggle,
}) => {
  const buttonId = `faq-btn-${id}`;
  const panelId = `faq-panel-${id}`;

  return (
    <div
      className={`rounded-2xl border transition-colors duration-200 ${
        isOpen
          ? 'bg-white border-[#0B7285] shadow-[0_6px_20px_-6px_rgba(11,114,133,0.12)]'
          : 'bg-white border-[#DCE6EF] hover:border-[#0B7285]/50'
      }`}
    >
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7285] rounded-2xl cursor-pointer"
        >
          <span className="font-display text-base font-semibold text-[#12324A]">
            {question}
          </span>
          <ChevronDown
            className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#0B7285]' : 'text-[#475569]'
            }`}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className={
          isOpen
            ? 'px-6 pb-5 pt-3 text-sm text-[#475569] leading-relaxed border-t border-slate-100'
            : 'hidden'
        }
      >
        {answer}
      </div>
    </div>
  );
};

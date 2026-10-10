import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel: string;
  accentColor?: 'cyan' | 'magenta' | 'green';
}

export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  label,
  sublabel,
  accentColor = 'cyan',
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    if (!isInView) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 1200;
    const startVal = Math.max(1, Math.floor(value * 0.15));

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + eased * (value - startVal));
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [isInView, value]);

  const colorMap = {
    cyan: 'text-[#00F0FF]',
    magenta: 'text-[#FF2BD6]',
    green: 'text-[#00FF85]',
  };

  const borderMap = {
    cyan: 'border-[#00F0FF]/25 hover:border-[#00F0FF]/55',
    magenta: 'border-[#FF2BD6]/25 hover:border-[#FF2BD6]/55',
    green: 'border-[#00FF85]/25 hover:border-[#00FF85]/55',
  };

  return (
    <div
      ref={ref}
      className={`relative rounded-xl bg-[#0D1238]/80 backdrop-blur-md border p-7 transition-colors duration-200 ${borderMap[accentColor]}`}
    >
      <div className={`font-display text-4xl sm:text-5xl font-bold tracking-tight font-mono-tabular ${colorMap[accentColor]}`}>
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-white">{label}</h3>
      <p className="mt-1 text-sm text-slate-400 leading-relaxed">{sublabel}</p>
    </div>
  );
};

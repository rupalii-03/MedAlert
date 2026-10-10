import React from 'react';
import { PatientTrackerStep } from '../../types/hospital';
import { CheckCircle2, Clock } from 'lucide-react';

interface StepTrackerProps {
  currentStep: PatientTrackerStep;
  onChangeStep?: (step: PatientTrackerStep) => void;
}

const STEPS: Array<{
  key: PatientTrackerStep;
  title: string;
  subtitle: string;
}> = [
  {
    key: 'Registered',
    title: '1. Registered',
    subtitle: 'Patient condition & urgency logged',
  },
  {
    key: 'Hospital notified',
    title: '2. Hospital Notified',
    subtitle: 'Triage desk alerted via live socket',
  },
  {
    key: 'Bed ready',
    title: '3. Bed Ready',
    subtitle: 'Ward bed & on-duty doctor assigned',
  },
  {
    key: 'Arrived',
    title: '4. Arrived',
    subtitle: 'Direct intake without waiting room delay',
  },
];

export const StepTracker: React.FC<StepTrackerProps> = ({
  currentStep,
  onChangeStep,
}) => {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="bg-[#F4F8FB] rounded-2xl border border-[#DCE6EF] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0B7285]">
          Live Patient Readiness Tracker
        </span>
        {onChangeStep && (
          <span className="text-xs text-[#475569]">
            Click a stage below to preview arrival progress
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={step.key}
              type="button"
              disabled={!onChangeStep}
              onClick={() => onChangeStep && onChangeStep(step.key)}
              className={`text-left rounded-xl p-3.5 border transition-all ${
                isCurrent
                  ? 'bg-white border-[#0B7285] shadow-xs ring-2 ring-[#0B7285]/15'
                  : isCompleted
                  ? 'bg-white border-[#BBF7D0]'
                  : 'bg-white/60 border-[#DCE6EF] opacity-75'
              } ${onChangeStep ? 'cursor-pointer hover:border-[#0B7285]' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-bold ${
                    isCurrent
                      ? 'text-[#0B7285]'
                      : isCompleted
                      ? 'text-[#15803D]'
                      : 'text-[#475569]'
                  }`}
                >
                  {step.title}
                </span>
                {isCompleted ? (
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      isCurrent ? 'text-[#0B7285]' : 'text-[#16A34A]'
                    }`}
                    aria-hidden="true"
                  />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                )}
              </div>
              <p className="mt-1 text-xs text-[#475569] leading-snug">
                {step.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { AvailabilityStatus } from '../../types/hospital';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AvailabilityStatus;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const config = {
    available: {
      defaultText: 'Beds Available',
      textColor: 'text-[#15803D]',
      Icon: CheckCircle2,
    },
    limited: {
      defaultText: 'Limited Capacity',
      textColor: 'text-[#B45309]',
      Icon: AlertTriangle,
    },
    full: {
      defaultText: 'Ward Full',
      textColor: 'text-[#DC2626]',
      Icon: XCircle,
    },
  }[status];

  const Icon = config.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${config.textColor}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label || config.defaultText}</span>
    </span>
  );
};

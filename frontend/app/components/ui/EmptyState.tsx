'use client';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, ctaLabel, onCta, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-[fadeIn_300ms_ease]">
      {/* Line-art illustration */}
      {icon ?? (
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          className="mb-6 opacity-40"
          aria-hidden="true"
        >
          <rect x="10" y="20" width="40" height="50" rx="4" stroke="#8C886B" strokeWidth="2" />
          <path d="M20 35h20M20 43h14M20 51h10" stroke="#8C886B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="58" cy="24" r="12" stroke="#8C886B" strokeWidth="2" />
          <path d="M54 24h8M58 20v8" stroke="#8C886B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}

      <h3 className="text-[17px] font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6">
        {description}
      </p>
      {ctaLabel && onCta && (
        <Button onClick={onCta} variant="primary">
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}

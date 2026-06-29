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
          <rect x="20" y="15" width="40" height="50" rx="4" stroke="#8C886B" strokeWidth="2" />
          <path d="M30 30h20M30 38h20M30 46h14" stroke="#8C886B" strokeWidth="2" strokeLinecap="round" />
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

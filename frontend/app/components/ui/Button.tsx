'use client';
import { cn } from '@/app/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-btn transition-all duration-150 cursor-pointer focus-ring select-none';

    const sizes = {
      sm: 'text-xs px-3 py-1.5',
      md: 'text-sm px-5 py-2',
      lg: 'text-base px-6 py-2.5',
    };

    const variants = {
      primary:     'btn-primary',
      ghost:       'btn-ghost',
      destructive: 'bg-transparent border border-[var(--risk-high)] text-[var(--risk-high)] hover:bg-[var(--risk-high)] hover:text-white active:scale-95 rounded-btn transition-all',
      outline:     'bg-transparent border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] active:scale-95 rounded-btn transition-all',
    };

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], variants[variant], disabled && 'opacity-50 cursor-not-allowed', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

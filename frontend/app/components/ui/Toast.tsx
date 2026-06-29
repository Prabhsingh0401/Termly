'use client';
import { useEffect } from 'react';
import { cn } from '@/app/lib/utils';
import { X, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'error' | 'success';
}

export function Toast({ message, onClose, type = 'error' }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-md px-4 flex justify-center">
      <div
        className={cn(
          'pointer-events-auto',
          'glass-card py-3.5 px-5 flex items-center gap-3',
          'animate-[slideInUp_250ms_ease-out]',
          'w-full border-l-4 shadow-xl'
        )}
        style={{
          borderLeftColor: type === 'error' ? 'var(--risk-high, #C0392B)' : 'var(--brand, #047C58)',
        }}
      >
        <AlertTriangle
          size={18}
          className={cn(
            type === 'error' ? 'text-[var(--risk-high, #C0392B)]' : 'text-[var(--brand, #047C58)]',
            'shrink-0'
          )}
        />
        <div className="flex-1 text-[13px] font-medium text-[var(--text-primary)] leading-snug">
          {message}
        </div>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0 focus:outline-none"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

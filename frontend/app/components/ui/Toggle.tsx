'use client';
import { useState } from 'react';
import { cn } from '@/app/lib/utils';

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Toggle({ checked = false, onChange, disabled = false, label, className }: ToggleProps) {
  const [internal, setInternal] = useState(checked);
  const isOn = onChange !== undefined ? checked : internal;

  const handleClick = () => {
    if (disabled) return;
    const next = !isOn;
    if (onChange) onChange(next);
    else setInternal(next);
  };

  return (
    <label className={cn('flex items-center gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <div
        role="switch"
        aria-checked={isOn}
        onClick={handleClick}
        className={cn(
          'toggle-track flex-shrink-0',
          isOn ? 'bg-[var(--brand)]' : 'bg-[var(--text-muted)]'
        )}
      >
        <div
          className={cn('toggle-thumb', isOn ? 'translate-x-[23px]' : 'translate-x-[3px]')}
        />
      </div>
      {label && (
        <span className="text-sm text-[var(--text-primary)]">{label}</span>
      )}
    </label>
  );
}

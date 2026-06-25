'use client';
import { cn } from '@/app/lib/utils';
import React from 'react';

interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsGroup({ title, description, children, className }: SettingsGroupProps) {
  return (
    <div className={cn('mb-8', className)}>
      {(title || description) && (
        <div className="mb-2 px-1">
          {title && <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">{title}</h3>}
          {description && <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>}
        </div>
      )}
      <div className="bg-[var(--surface)] rounded-[16px] border border-[var(--border)] shadow-sm overflow-hidden divide-y divide-[var(--border)]">
        {children}
      </div>
    </div>
  );
}

interface SettingsItemProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  value?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function SettingsItem({ icon, label, description, value, action, onClick, className }: SettingsItemProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between p-4 bg-[var(--surface)] text-left transition-colors duration-150',
        onClick && 'hover:bg-[var(--brand-muted)] active:bg-[var(--surface-deep)] cursor-pointer',
        className
      )}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--surface-deep)] flex items-center justify-center text-[var(--brand)]">
            {icon}
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{label}</p>
          {description && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
      
      {(value || action) && (
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {value && <span className="text-sm text-[var(--text-muted)]">{value}</span>}
          {action && <div>{action}</div>}
        </div>
      )}
    </Component>
  );
}

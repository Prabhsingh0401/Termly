'use client';
import { cn } from '@/app/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hoverable = false, onClick }: CardProps) {
  return (
    <div
      className={cn('glass-card p-6', hoverable && 'glass-card-hover cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-5', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-[15px] font-semibold text-[var(--text-primary)]', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}

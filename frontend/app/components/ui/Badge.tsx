'use client';
import { cn } from '@/app/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'expiring' | 'expired' | 'draft' | 'pending' | 'renewed' | 'terminated'
           | 'risk-low' | 'risk-medium' | 'risk-high' | 'default';
  className?: string;
}

const variantClass: Record<string, string> = {
  active:     'badge-active',
  expiring:   'badge-expiring',
  expired:    'badge-expired',
  draft:      'badge-draft',
  pending:    'badge-pending',
  renewed:    'badge-renewed',
  terminated: 'badge-terminated',
  'risk-low':    'badge-risk-low',
  'risk-medium': 'badge-risk-medium',
  'risk-high':   'badge-risk-high',
  default:    'badge-draft',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('badge', variantClass[variant], className)}>
      {children}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: 'low' | 'medium' | 'high' }) {
  return (
    <Badge variant={`risk-${risk}` as BadgeProps['variant']}>
      {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status as BadgeProps['variant']}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

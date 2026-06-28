import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(d.getTime())) return '—';
    return format(d, 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(d.getTime())) return '—';
    return format(d, 'dd MMM yy');
  } catch {
    return '—';
  }
}

export function daysUntil(date: string | Date | null | undefined): number {
  if (!date) return 0;
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(d.getTime())) return 0;
    return differenceInDays(d, new Date());
  } catch {
    return 0;
  }
}

export function getRiskBadgeClass(risk: 'low' | 'medium' | 'high'): string {
  return {
    low: 'badge badge-risk-low',
    medium: 'badge badge-risk-medium',
    high: 'badge badge-risk-high',
  }[risk];
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    active: 'badge badge-active',
    expiring: 'badge badge-expiring',
    expired: 'badge badge-expired',
    draft: 'badge badge-draft',
    pending: 'badge badge-pending',
    renewed: 'badge badge-renewed',
    terminated: 'badge badge-terminated',
    overdue: 'badge badge-expired',
    completed: 'badge badge-active',
  };
  return map[status] ?? 'badge badge-draft';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

'use client';
import { Card } from '@/app/components/ui/Card';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { formatCurrency, cn } from '@/app/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  delta?: { value: string; positive: boolean };
  icon: React.ReactNode;
  loading?: boolean;
  accent?: boolean;
  className?: string;
}

export function KPICard({ label, value, delta, icon, loading, accent, className }: KPICardProps) {
  if (loading) {
    return (
      <div className={cn("glass-card p-6", className)}>
        <Skeleton className="h-3 w-1/2 mb-4" />
        <Skeleton className="h-8 w-2/3 mb-3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    );
  }

  return (
    <Card className={cn("glass-card-hover", className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="label-muted">{label}</p>
        <div className={`w-8 h-8 rounded-badge flex items-center justify-center ${accent ? 'bg-[var(--brand-muted)]' : 'bg-[var(--surface-deep)]'}`}>
          <span className={accent ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'}>{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-semibold tracking-tighter text-[var(--text-primary)] leading-none mb-2">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {delta && (
        <div className={`flex items-center gap-1 text-xs font-medium ${delta.positive ? 'text-[var(--brand)]' : 'text-[var(--risk-high)]'}`}>
          {delta.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta.value}
        </div>
      )}
    </Card>
  );
}

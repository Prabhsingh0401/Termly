'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { StatusBadge } from '@/app/components/ui/Badge';
import { formatDate, daysUntil, cn } from '@/app/lib/utils';
import { Obligation } from '@/app/lib/dummy-data';
import { AlertTriangle } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  payment: 'Payment', renewal: 'Renewal', audit: 'Audit',
  review: 'Review', notice: 'Notice', custom: 'Custom',
};

export function ObligationsTable({ obligations }: { obligations: Obligation[] }) {
  const sorted = [...obligations].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Upcoming Obligations & Billing</CardTitle>
        <Link href="/contracts" className="text-xs text-[var(--brand)] font-semibold hover:underline">
          View all →
        </Link>
      </CardHeader>
      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {['Description', 'Contract', 'Type', 'Assigned To', 'Due Date', 'Status'].map((h) => (
                <th key={h} className="label-muted text-left px-6 py-2 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((ob, i) => {
              const days = daysUntil(ob.dueDate);
              const isAmber = days <= 30 && days >= 0;
              const isOverdue = ob.status === 'overdue' || days < 0;
              return (
                <tr
                  key={ob.id}
                  className={cn(
                    'table-row-hover border-b border-[var(--border)] transition-colors',
                    i % 2 === 1 && 'bg-[var(--surface-deep)]',
                    isOverdue && 'border-l-[3px] border-l-[var(--risk-high)]',
                  )}
                >
                  <td className="px-6 py-3 font-medium text-[var(--text-primary)] max-w-xs truncate">
                    {isOverdue && <AlertTriangle size={12} className="inline mr-1 text-[var(--risk-high)]" />}
                    {ob.description}
                  </td>
                  <td className="px-6 py-3 text-[var(--text-muted)] truncate max-w-[140px]">{ob.contractTitle}</td>
                  <td className="px-6 py-3">
                    <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--surface-deep)] px-2 py-1 rounded-badge">
                      {TYPE_LABELS[ob.type]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[var(--text-muted)]">{ob.assignedTo}</td>
                  <td className={cn('px-6 py-3 font-medium whitespace-nowrap', isAmber && 'text-[var(--risk-medium)]', isOverdue && 'text-[var(--risk-high)]')}>
                    {formatDate(ob.dueDate)}
                    {isOverdue && <span className="ml-1 text-[10px]">(Overdue)</span>}
                    {isAmber && !isOverdue && <span className="ml-1 text-[10px]">({days}d)</span>}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={ob.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

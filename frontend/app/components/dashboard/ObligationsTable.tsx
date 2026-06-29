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
      
      {/* Mobile Card List View (visible on mobile only) */}
      <div className="block md:hidden divide-y divide-[var(--border)] -mx-6">
        {sorted.map((ob) => {
          const days = daysUntil(ob.dueDate);
          const isAmber = days <= 30 && days >= 0;
          const isOverdue = ob.status === 'overdue' || days < 0;
          return (
            <div
              key={ob.id}
              className={cn(
                'p-4 flex flex-col gap-2 transition-colors border-b border-[var(--border)]',
                isOverdue && 'border-l-[3px] border-l-[var(--risk-high)]'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--text-primary)] leading-tight text-sm">
                    {isOverdue && <AlertTriangle size={12} className="inline mr-1 text-[var(--risk-high)]" />}
                    {ob.description}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {ob.contractTitle}
                    <span className="ml-1.5 text-[9px] bg-[var(--surface-deep)] px-1.5 py-0.5 rounded text-[var(--text-muted)] font-normal uppercase">
                      {ob.docType === 'bill' ? 'Bill' : 'Contract'}
                    </span>
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={ob.status} />
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 text-xs pl-0">
                <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--surface-deep)] px-2 py-0.5 rounded-badge">
                  {TYPE_LABELS[ob.type]}
                </span>
                <span className={cn('font-medium', isAmber && 'text-[var(--risk-medium)]', isOverdue && 'text-[var(--risk-high)]')}>
                  Due: {formatDate(ob.dueDate)}
                  {isOverdue && <span className="ml-1 text-[10px] font-normal">(Overdue)</span>}
                  {isAmber && !isOverdue && <span className="ml-1 text-[10px] font-normal">({days}d)</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (visible on md screens and above) */}
      <div className="hidden md:block overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {['Description', 'Document', 'Type', 'Assigned To', 'Due Date', 'Status'].map((h) => (
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
                  <td className="px-6 py-3 text-[var(--text-muted)] truncate max-w-[160px]">
                    {ob.contractTitle}
                    <span className="ml-1.5 text-[10px] bg-[var(--surface-deep)] px-1.5 py-0.5 rounded text-[var(--text-muted)] font-normal uppercase">
                      {ob.docType === 'bill' ? 'Bill' : 'Contract'}
                    </span>
                  </td>
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

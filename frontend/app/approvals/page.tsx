'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { StatusBadge } from '@/app/components/ui/Badge';
import { APPROVALS } from '@/app/lib/dummy-data';
import { formatCurrency, formatDate, cn } from '@/app/lib/utils';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ApprovalsPage() {
  const [decisions, setDecisions] = useState<Record<string, 'approve' | 'reject' | null>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setDecisions((d) => ({ ...d, [id]: action }));
    setExpanded((e) => ({ ...e, [id]: false }));
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="heading text-xl">Approvals</h2>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">{APPROVALS.length} pending for your review</p>
      </div>

      <div className="space-y-4 max-w-3xl">
        {APPROVALS.map((approval) => {
          const decision = decisions[approval.id];
          const isExpanded = expanded[approval.id];
          const currentStep = approval.chain.findIndex((s) => s.status === 'pending');

          return (
            <Card key={approval.id} className={cn(decision && 'opacity-60')}>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{approval.contractTitle}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {approval.vendorName} · {formatCurrency(approval.value)} · Requested by {approval.requestedBy} on {formatDate(approval.requestedAt)}
                  </p>
                </div>
                <StatusBadge status="pending" />
              </div>

              {/* Approval chain stepper */}
              <div className="flex items-center gap-0 mb-5 overflow-x-auto pb-1">
                {approval.chain.map((step, i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[100px]">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 mb-1.5',
                        step.status === 'approved' ? 'bg-[var(--brand)] border-[var(--brand)] text-white' : 'border-[var(--text-muted)] text-[var(--text-muted)] bg-transparent',
                        step.status === 'pending' && i === currentStep && 'animate-[pulseRing_1.5s_ease_infinite]',
                      )}>
                        {step.status === 'approved' ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                      </div>
                      <p className="text-[11px] font-medium text-[var(--text-primary)] text-center whitespace-nowrap">{step.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] text-center">{step.role}</p>
                    </div>
                    {i < approval.chain.length - 1 && (
                      <div className={cn('h-0.5 w-12 mx-1 flex-shrink-0', i < currentStep ? 'bg-[var(--brand)]' : 'bg-[var(--border)]')} />
                    )}
                  </div>
                ))}
              </div>
              <p className="label-muted mb-4">Step {currentStep + 1} of {approval.chain.length}</p>

              {/* Action buttons */}
              {decision ? (
                <div className={cn('flex items-center gap-2 text-sm font-medium', decision === 'approve' ? 'text-[var(--brand)]' : 'text-[var(--risk-high)]')}>
                  {decision === 'approve' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {decision === 'approve' ? 'You approved this contract' : 'You rejected this contract'}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => setExpanded((e) => ({ ...e, [approval.id]: true }))}>
                      <CheckCircle2 size={13} /> Approve
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setExpanded((e) => ({ ...e, [approval.id]: true }))}>
                      <XCircle size={13} /> Reject
                    </Button>
                  </div>
                  {isExpanded && (
                    <div className="animate-[slideInUp_150ms_ease]">
                      <textarea
                        value={comments[approval.id] ?? ''}
                        onChange={(e) => setComments((c) => ({ ...c, [approval.id]: e.target.value }))}
                        placeholder="Add a comment (optional)…"
                        rows={3}
                        className="w-full px-3 py-2 text-sm rounded-badge border border-[var(--border)] bg-[var(--surface-deep)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button variant="primary" size="sm" onClick={() => handleAction(approval.id, 'approve')}>Confirm Approve</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleAction(approval.id, 'reject')}>Confirm Reject</Button>
                        <Button variant="ghost" size="sm" onClick={() => setExpanded((e) => ({ ...e, [approval.id]: false }))}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

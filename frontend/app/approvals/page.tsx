'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { StatusBadge } from '@/app/components/ui/Badge';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { formatCurrency, formatDate, cn } from '@/app/lib/utils';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisions, setDecisions] = useState<Record<string, { decision: string; comment: string }>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/workflows');
        setApprovals(res.data.data ?? []);
      } catch {
        setApprovals([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const comment = comments[id] ?? '';
    setSubmitting((s) => ({ ...s, [id]: true }));
    try {
      await axios.post(`/workflows/${id}/approve`, { decision: action, comment });
      setDecisions((d) => ({ ...d, [id]: { decision: action, comment } }));
      setExpanded((e) => ({ ...e, [id]: false }));
      // Remove from list after a short visual delay
      setTimeout(() => {
        setApprovals((prev) => prev.filter((a) => a.id !== id));
      }, 800);
    } catch {
      // surface error silently — keep card in list
    } finally {
      setSubmitting((s) => ({ ...s, [id]: false }));
    }
  };

  // Derive a minimal chain from DB contract data (no chain stored in DB — show single-step chain)
  const buildChain = (approval: any) => [
    { name: approval.created_by_name ?? 'Requester', role: 'Requester', status: 'approved' },
    { name: 'You', role: 'Reviewer', status: 'pending' },
  ];

  return (
    <DashboardLayout>
      <div className="pb-28 md:pb-6 max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="heading text-xl">Approvals</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {loading ? '…' : `${approvals.length} pending for your review`}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-card p-6 animate-pulse">
                <div className="h-4 bg-[var(--border)] rounded w-2/5 mb-3" />
                <div className="h-3 bg-[var(--border)] rounded w-1/3 mb-6" />
                <div className="h-8 bg-[var(--border)] rounded w-full" />
              </div>
            ))}
          </div>
        ) : approvals.length === 0 && Object.keys(decisions).length === 0 ? (
          <EmptyState
            title="No pending approvals"
            description="All contracts have been reviewed. You're all caught up."
            ctaLabel="View contracts"
            onCta={() => (window.location.href = '/contracts')}
          />
        ) : (
          <div className="space-y-4">
            {approvals.map((approval) => {
              const decision = decisions[approval.id];
              const isExpanded = expanded[approval.id];
              const chain = buildChain(approval);
              const currentStep = chain.findIndex((s) => s.status === 'pending');

              return (
                <Card key={approval.id} className={cn(decision && 'opacity-60')}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{approval.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {approval.vendor_name} · {formatCurrency(approval.value)} · Requested by {approval.created_by_name ?? 'Unknown'} on {formatDate(approval.created_at)}
                      </p>
                    </div>
                    <StatusBadge status="pending" />
                  </div>

                  {/* Approval chain stepper */}
                  <div className="flex items-center gap-0 mb-5 overflow-x-auto pb-1">
                    {chain.map((step, i) => (
                      <div key={i} className="flex items-center">
                        <div className="flex flex-col items-center min-w-[100px]">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 mb-1.5',
                              step.status === 'approved'
                                ? 'bg-[var(--brand)] border-[var(--brand)] text-white'
                                : 'border-[var(--text-muted)] text-[var(--text-muted)] bg-transparent',
                              step.status === 'pending' && i === currentStep && 'animate-[pulseRing_1.5s_ease_infinite]'
                            )}
                          >
                            {step.status === 'approved' ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                          </div>
                          <p className="text-[11px] font-medium text-[var(--text-primary)] text-center whitespace-nowrap">{step.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)] text-center">{step.role}</p>
                        </div>
                        {i < chain.length - 1 && (
                          <div className={cn('h-0.5 w-12 mx-1 flex-shrink-0', i < currentStep ? 'bg-[var(--brand)]' : 'bg-[var(--border)]')} />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="label-muted mb-4">Step {currentStep + 1} of {chain.length}</p>

                  {/* Action buttons */}
                  {decision ? (
                    <div className={cn('flex items-center gap-2 text-sm font-medium', decision.decision === 'approved' ? 'text-[var(--brand)]' : 'text-[var(--risk-high)]')}>
                      {decision.decision === 'approved' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {decision.decision === 'approved' ? 'You approved this contract' : 'You rejected this contract'}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setExpanded((e) => ({ ...e, [approval.id]: true }))}
                        >
                          <CheckCircle2 size={13} /> Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setExpanded((e) => ({ ...e, [approval.id]: true }))}
                        >
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
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={submitting[approval.id]}
                              onClick={() => handleAction(approval.id, 'approved')}
                            >
                              {submitting[approval.id] ? 'Saving…' : 'Confirm Approve'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={submitting[approval.id]}
                              onClick={() => handleAction(approval.id, 'rejected')}
                            >
                              {submitting[approval.id] ? 'Saving…' : 'Confirm Reject'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpanded((e) => ({ ...e, [approval.id]: false }))}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

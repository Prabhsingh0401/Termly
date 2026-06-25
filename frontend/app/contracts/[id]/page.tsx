'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { RiskBadge, StatusBadge } from '@/app/components/ui/Badge';
import { CONTRACTS, OBLIGATIONS, APPROVALS } from '@/app/lib/dummy-data';
import { formatDate, formatCurrency, daysUntil, cn } from '@/app/lib/utils';
import { ArrowLeft, Edit, Download, Archive, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { useState } from 'react';

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [openClause, setOpenClause] = useState<string | null>(null);

  const contract = CONTRACTS.find((c) => c.id === id);
  if (!contract) return (
    <DashboardLayout>
      <div className="text-center py-20 text-[var(--text-muted)]">Contract not found.</div>
    </DashboardLayout>
  );

  const obligations = OBLIGATIONS.filter((o) => o.contractId === id);
  const approval = APPROVALS.find((a) => a.contractId === id);

  const CLAUSES = [
    { id: 'parties', title: 'Parties', text: `This agreement is between ${contract.vendorName} ("Vendor") and Termly Corp ("Client"), effective ${formatDate(contract.startDate)}.` },
    { id: 'term', title: 'Term & Renewal', text: `The initial term is from ${formatDate(contract.startDate)} to ${formatDate(contract.endDate)}. ${contract.autoRenewal ? `This agreement automatically renews unless written notice is provided ${contract.noticePeriodDays} days before expiry.` : 'This agreement does not auto-renew.'}` },
    { id: 'payment', title: 'Payment Terms', text: `Client agrees to pay ${formatCurrency(contract.value, contract.currency)} per year, ${contract.paymentTerms}. Late payments incur a 1.5% monthly interest charge.` },
    { id: 'governing', title: 'Governing Law', text: `This agreement shall be governed by the laws of ${contract.governingLaw}. All disputes shall be resolved through binding arbitration.` },
    { id: 'termination', title: 'Termination', text: `Either party may terminate this agreement with ${contract.noticePeriodDays} days written notice. Immediate termination is available in the event of material breach.` },
  ];

  const TIMELINE = [
    { label: 'Contract Start', date: contract.startDate },
    { label: 'Mid-term Review', date: new Date(new Date(contract.startDate).getTime() + (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / 2).toISOString().split('T')[0] },
    { label: `Notice Deadline`, date: new Date(new Date(contract.endDate).getTime() - contract.noticePeriodDays * 86400000).toISOString().split('T')[0] },
    { label: 'Contract End', date: contract.endDate },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="heading text-xl">{contract.title}</h2>
              <StatusBadge status={contract.status} />
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{contract.vendorName} · {contract.contractType}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Edit size={13} /> Edit</Button>
          <Button variant="ghost" size="sm"><Download size={13} /> Export</Button>
          <Button variant="destructive" size="sm"><Archive size={13} /> Archive</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Key Dates Timeline */}
          <Card>
            <h3 className="font-semibold text-[var(--text-primary)] mb-5">Key Dates</h3>
            <div className="relative overflow-x-auto pb-2">
              <div className="flex items-center min-w-max gap-0">
                {TIMELINE.map((point, i) => {
                  const isPast = new Date(point.date) < new Date();
                  return (
                    <div key={point.label} className="flex items-center">
                      <div className="flex flex-col items-center group">
                        <div className={cn(
                          'w-3 h-3 rounded-full border-2 transition-transform group-hover:scale-125',
                          isPast ? 'bg-[var(--brand)] border-[var(--brand)]' : 'bg-white border-[var(--text-muted)]'
                        )} title={`${point.label}: ${formatDate(point.date)}`} />
                        <div className="mt-2 text-center">
                          <p className="text-[11px] font-semibold text-[var(--text-primary)] whitespace-nowrap">{point.label}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{formatDate(point.date)}</p>
                        </div>
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className="h-0.5 w-32 mx-1 bg-[var(--brand)] opacity-30 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Clauses Accordion */}
          <Card>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Extracted Clauses</h3>
            <div className="space-y-2">
              {CLAUSES.map((clause) => (
                <div key={clause.id} className="border border-[var(--border)] rounded-badge overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--brand-muted)] transition-colors"
                    onClick={() => setOpenClause(openClause === clause.id ? null : clause.id)}
                  >
                    <span className="text-sm font-medium text-[var(--text-muted)]">{clause.title}</span>
                    <span className={cn('text-[var(--text-muted)] transition-transform', openClause === clause.id && 'rotate-180')}>▾</span>
                  </button>
                  {openClause === clause.id && (
                    <div className="px-4 pb-4 pt-2 bg-[var(--surface-deep)] animate-[fadeIn_150ms_ease]">
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{clause.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Obligations Table */}
          {obligations.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="p-5 border-b border-[var(--border)]">
                <h3 className="font-semibold text-[var(--text-primary)]">Obligations</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {['Description', 'Type', 'Due Date', 'Status'].map((h) => (
                      <th key={h} className="label-muted text-left px-5 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {obligations.map((ob, i) => {
                    const isOverdue = ob.status === 'overdue';
                    return (
                      <tr key={ob.id} className={cn(
                        'border-b border-[var(--border)] table-row-hover',
                        i % 2 === 1 && 'bg-[var(--surface-deep)]',
                        isOverdue && 'border-l-[3px] border-l-[var(--risk-high)]',
                      )}>
                        <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{ob.description}</td>
                        <td className="px-5 py-3 text-[var(--text-muted)] capitalize">{ob.type}</td>
                        <td className={cn('px-5 py-3', isOverdue && 'text-[var(--risk-high)] font-medium')}>{formatDate(ob.dueDate)}</td>
                        <td className="px-5 py-3"><StatusBadge status={ob.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        {/* Sidebar — 1 col */}
        <div className="flex flex-col gap-4">
          {/* Summary */}
          <Card>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Contract Summary</h3>
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Value', value: formatCurrency(contract.value, contract.currency) },
                { label: 'Start Date', value: formatDate(contract.startDate) },
                { label: 'End Date', value: formatDate(contract.endDate) },
                { label: 'Notice Period', value: `${contract.noticePeriodDays} days` },
                { label: 'Auto-Renewal', value: contract.autoRenewal ? '✅ Enabled' : '❌ Disabled' },
                { label: 'Governing Law', value: contract.governingLaw },
                { label: 'Payment Terms', value: contract.paymentTerms },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-[var(--text-muted)]">{label}</dt>
                  <dd className="font-medium text-[var(--text-primary)] text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Risk */}
          <Card className="bg-[var(--surface-deep)]">
            <div className="flex items-center gap-2 mb-3">
              <RiskBadge risk={contract.aiRiskScore} />
            </div>
            <p className="text-[13px] text-[var(--text-muted)] italic leading-relaxed">{contract.aiSummary}</p>
          </Card>

          {/* Approval Workflow */}
          {approval && (
            <Card>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Approval Workflow</h3>
              <div className="flex flex-col gap-3">
                {approval.chain.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5',
                      step.status === 'approved' ? 'bg-[var(--brand)] text-white' : 'border-2 border-[var(--text-muted)] text-[var(--text-muted)]',
                      step.status === 'pending' && i === approval.chain.findIndex(s => s.status === 'pending') && 'animate-[pulseRing_1.5s_ease_infinite]'
                    )}>
                      {step.status === 'approved' ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{step.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{step.role}</p>
                      {step.at && <p className="text-[10px] text-[var(--brand)] mt-0.5">{formatDate(step.at)}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="label-muted mt-4">Step {approval.chain.filter(s => s.status === 'approved').length + 1} of {approval.chain.length}</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

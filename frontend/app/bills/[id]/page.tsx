'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { RiskBadge, StatusBadge } from '@/app/components/ui/Badge';
import { formatDate, formatCurrency, cn } from '@/app/lib/utils';
import { ArrowLeft, Edit, Download, Archive, CheckCircle2, Clock, Landmark } from 'lucide-react';

export default function BillDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [openClause, setOpenClause] = useState<string | null>(null);
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/contracts/${id}`)
      .then((r) => {
        setBill(r.data.data ?? r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse px-4 py-6">
          <div className="h-8 bg-[var(--surface-deep)] rounded w-1/3" />
          <div className="h-40 bg-[var(--surface-deep)] rounded" />
          <div className="h-60 bg-[var(--surface-deep)] rounded" />
        </div>
      </DashboardLayout>
    );
  }

  if (!bill || bill.document_type !== 'bill') {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-[var(--text-muted)]">Bill not found.</div>
      </DashboardLayout>
    );
  }

  const obligations: any[] = bill.obligations ?? [];
  const vendorName = bill.vendorName || bill.vendor_name || 'Biller / Merchant';
  const orgName = bill.orgName || bill.org_name || 'Client';
  const startDate = bill.startDate || bill.start_date;
  const endDate = bill.endDate || bill.end_date;
  const paymentTerms = bill.paymentTerms ?? bill.payment_terms ?? 'Standard Terms';
  const billType = bill.contractType ?? bill.contract_type ?? 'Invoice';

  const TERMS = [
    { id: 'biller', title: 'Biller & Client', text: `This invoice was issued by ${vendorName} to ${orgName}, dated ${formatDate(startDate)}.` },
    { id: 'payment', title: 'Payment Terms & Amount', text: `Total balance due is ${formatCurrency(bill.value, bill.currency)} under terms: ${paymentTerms}.` },
    { id: 'due', title: 'Due Date & Period', text: `Payment is due on or before ${formatDate(endDate)}.` },
  ];

  const TIMELINE = startDate && endDate ? [
    { label: 'Invoice Issued', date: startDate },
    { label: 'Payment Due Date', date: endDate },
  ] : [];

  return (
    <DashboardLayout>
      <div className="pb-28 md:pb-6 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="heading text-xl">{bill.title}</h2>
                <StatusBadge status={bill.status} />
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">{vendorName} · {billType}</p>
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
            {TIMELINE.length > 0 && (
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-5">Timeline</h3>
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
            )}

            {/* Extracted Terms */}
            <Card>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Extracted Billing Terms</h3>
              <div className="space-y-2">
                {TERMS.map((term) => (
                  <div key={term.id} className="border border-[var(--border)] rounded-badge overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--brand-muted)] transition-colors"
                      onClick={() => setOpenClause(openClause === term.id ? null : term.id)}
                    >
                      <span className="text-sm font-medium text-[var(--text-muted)]">{term.title}</span>
                      <span className={cn('text-[var(--text-muted)] transition-transform', openClause === term.id && 'rotate-180')}>▾</span>
                    </button>
                    {openClause === term.id && (
                      <div className="px-4 pb-4 pt-2 bg-[var(--surface-deep)] animate-[fadeIn_150ms_ease]">
                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{term.text}</p>
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
                  <h3 className="font-semibold text-[var(--text-primary)]">Billing Milestones & Actions</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['Action Required', 'Type', 'Due Date', 'Status'].map((h) => (
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
                          <td className={cn('px-5 py-3', isOverdue && 'text-[var(--risk-high)] font-medium')}>{formatDate(ob.dueDate ?? ob.due_date)}</td>
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
            {/* Bill Summary */}
            <Card>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Landmark size={16} className="text-[var(--brand)]" />
                Bill Details
              </h3>
              <dl className="space-y-3 text-sm">
                {[
                  { label: 'Amount Due', value: formatCurrency(bill.value, bill.currency) },
                  { label: 'Invoice Date', value: formatDate(startDate) },
                  { label: 'Due Date', value: formatDate(endDate) },
                  { label: 'Merchant / Issuer', value: vendorName },
                  { label: 'Biller Category', value: bill.category || 'Utility / Services' },
                  { label: 'Billing Terms', value: paymentTerms },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-0 last:pb-0">
                    <dt className="text-[var(--text-muted)]">{label}</dt>
                    <dd className="font-medium text-[var(--text-primary)] text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            {/* Risk Assessment */}
            <Card className="bg-[var(--surface-deep)]">
              <div className="flex items-center gap-2 mb-3">
                <RiskBadge risk={bill.aiRiskScore ?? bill.ai_risk_score} />
                <span className="text-xs font-semibold text-[var(--text-primary)]">AI Document Audit</span>
              </div>
              <p className="text-[13px] text-[var(--text-muted)] italic leading-relaxed">{bill.aiSummary ?? bill.ai_summary}</p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

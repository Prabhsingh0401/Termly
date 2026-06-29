'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { RiskBadge, StatusBadge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { formatCurrency, formatDate } from '@/app/lib/utils';
import { ArrowLeft, Globe, Mail } from 'lucide-react';

const TABS = ['Contracts', 'Billing', 'Compliance Docs', 'Risk History'];

export default function VendorProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [vendor, setVendor] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/vendors/${id}`)
      .then((r) => {
        setVendor(r.data.vendor);
        setContracts(r.data.contracts ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-[var(--surface-deep)] rounded w-1/4" />
          <div className="h-40 bg-[var(--surface-deep)] rounded" />
          <div className="h-60 bg-[var(--surface-deep)] rounded" />
        </div>
      </DashboardLayout>
    );
  }

  if (!vendor) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-[var(--text-muted)]">Vendor not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--brand)] mb-5 transition-colors">
        <ArrowLeft size={16} /> Back to Vendors
      </button>

      {/* Vendor header card */}
      <Card className="mb-5 border-l-[3px] border-l-[var(--brand)]">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-card bg-[var(--brand-muted)] flex items-center justify-center text-[var(--brand)] font-bold text-lg flex-shrink-0">
              {vendor.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="heading text-xl">{vendor.name}</h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {vendor.category && (
                  <span className="text-xs bg-[var(--surface-deep)] px-2 py-1 rounded-badge text-[var(--text-muted)] font-medium">{vendor.category}</span>
                )}
                {vendor.country && (
                  <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><Globe size={12} />{vendor.country}</span>
                )}
                {vendor.contact_email && (
                  <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><Mail size={12} />{vendor.contact_email}</span>
                )}
              </div>
            </div>
          </div>
          <RiskBadge risk={vendor.risk_score} />
        </div>

        {/* Aggregate stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-[var(--border)]">
          {[
            { label: 'Active Contracts', value: vendor.active_contracts ?? 0 },
            { label: 'Total Spend', value: formatCurrency(vendor.total_spend ?? 0) },
            { label: 'Aggregate Risk', value: (vendor.risk_score ?? '—').toUpperCase() },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="label-muted mb-1">{label}</p>
              <p className="font-bold text-lg text-[var(--text-primary)]">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-0 mb-5 border-b border-[var(--border)] relative overflow-x-auto">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === i ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
            {activeTab === i && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand)] rounded-t animate-[fadeIn_150ms_ease]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  {['Contract', 'Value', 'Expiry', 'Status', 'Risk'].map((h) => (
                    <th key={h} className="label-muted text-left px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-[var(--text-muted)] text-sm">No contracts linked to this vendor.</td>
                  </tr>
                ) : contracts.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`table-row-hover border-b border-[var(--border)] cursor-pointer ${i % 2 === 1 ? 'bg-[var(--surface-deep)]' : ''}`}
                    onClick={() => router.push(`/contracts/${c.id}`)}
                  >
                    <td className="px-5 py-3 font-medium text-[var(--text-primary)] whitespace-nowrap">{c.title}</td>
                    <td className="px-5 py-3 whitespace-nowrap">{formatCurrency(c.value, c.currency)}</td>
                    <td className="px-5 py-3 text-[var(--text-muted)] whitespace-nowrap">{formatDate(c.end_date ?? c.endDate)}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3"><RiskBadge risk={c.ai_risk_score ?? c.aiRiskScore} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {activeTab === 1 && <div className="text-sm text-[var(--text-muted)] p-6">Billing records will appear here once connected to backend.</div>}
      {activeTab === 2 && <div className="text-sm text-[var(--text-muted)] p-6">Compliance documents (insurance certs, etc.) will appear here.</div>}
      {activeTab === 3 && <div className="text-sm text-[var(--text-muted)] p-6">Risk history timeline will appear here.</div>}
    </DashboardLayout>
  );
}

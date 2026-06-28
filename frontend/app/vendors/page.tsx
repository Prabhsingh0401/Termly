'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { RiskBadge } from '@/app/components/ui/Badge';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { formatCurrency } from '@/app/lib/utils';
import { Plus, Globe } from 'lucide-react';

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/vendors')
      .then((r) => {
        setVendors(r.data.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading text-xl">Vendors</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{vendors.length} vendors tracked</p>
        </div>
        <Button variant="primary" size="sm"><Plus size={14} /> Add Vendor</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse bg-[var(--surface-deep)] rounded mb-2" />
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <EmptyState
            title="No vendors yet"
            description="Add your first vendor to start tracking contracts and spend."
            ctaLabel="Add Vendor"
            onCta={() => {}}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  {['Vendor', 'Category', 'Country', 'Risk Score', 'Active Contracts', 'Total Spend'].map((h) => (
                    <th key={h} className="label-muted text-left px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map((v, i) => (
                  <tr
                    key={v.id}
                    className={`table-row-hover border-b border-[var(--border)] cursor-pointer transition-colors ${i % 2 === 1 ? 'bg-[var(--surface-deep)]' : ''}`}
                    onClick={() => router.push(`/vendors/${v.id}`)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-badge bg-[var(--brand-muted)] flex items-center justify-center text-[var(--brand)] font-bold text-xs flex-shrink-0">
                          {v.name.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="font-medium text-[var(--text-primary)]">{v.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-muted)]">{v.category}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-[var(--text-muted)]"><Globe size={12} />{v.country}</span>
                    </td>
                    <td className="px-5 py-3"><RiskBadge risk={v.risk_score} /></td>
                    <td className="px-5 py-3 text-[var(--text-primary)] font-medium">{v.active_contract_count ?? 0}</td>
                    <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{formatCurrency(v.total_spend ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

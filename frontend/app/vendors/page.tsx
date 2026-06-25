'use client';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { RiskBadge } from '@/app/components/ui/Badge';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { VENDORS } from '@/app/lib/dummy-data';
import { formatCurrency } from '@/app/lib/utils';
import { Plus, Globe, Mail } from 'lucide-react';

export default function VendorsPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading text-xl">Vendors</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{VENDORS.length} vendors tracked</p>
        </div>
        <Button variant="primary" size="sm"><Plus size={14} /> Add Vendor</Button>
      </div>

      <Card className="p-0 overflow-hidden">
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
              {VENDORS.map((v, i) => (
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
                  <td className="px-5 py-3"><RiskBadge risk={v.riskScore} /></td>
                  <td className="px-5 py-3 text-[var(--text-primary)] font-medium">{v.activeContractCount}</td>
                  <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{formatCurrency(v.totalSpend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

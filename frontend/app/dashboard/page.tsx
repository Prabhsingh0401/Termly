'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { KPICard } from '@/app/components/dashboard/KPICard';
import { SpendByCategoryChart } from '@/app/components/dashboard/SpendByCategoryChart';
import { StatusDonutChart } from '@/app/components/dashboard/StatusDonutChart';
import { ObligationsTable } from '@/app/components/dashboard/ObligationsTable';
import { formatCurrency } from '@/app/lib/utils';
import { FileText, DollarSign, Clock, AlertCircle, CreditCard } from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);

    axios.get('/dashboard/stats')
      .then((r) => setStats(r.data))
      .catch(console.error);

    return () => clearTimeout(t);
  }, []);

  return (
    <DashboardLayout>
      <div className="pb-28 md:pb-6 max-w-6xl mx-auto px-4">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <KPICard
            label="Active Contracts"
            value={stats?.activeContracts ?? 0}
            icon={<FileText size={16} />}
            delta={{ value: 'Ongoing agreements', positive: true }}
            loading={loading}
            accent
          />
          <KPICard
            label="Active Bills"
            value={stats?.activeBills ?? 0}
            icon={<CreditCard size={16} />}
            delta={{ value: 'Pending receivables', positive: true }}
            loading={loading}
          />
          <KPICard
            label="Total Outgoing Spend"
            value={formatCurrency(stats?.totalSpend ?? 0)}
            icon={<DollarSign size={16} />}
            delta={{ value: 'Contract liabilities', positive: false }}
            loading={loading}
          />
          <KPICard
            label="Expected Incoming Bills"
            value={formatCurrency(stats?.totalReceivables ?? 0)}
            icon={<DollarSign size={16} />}
            delta={{ value: 'Billing receivables', positive: true }}
            loading={loading}
            accent
          />
          <KPICard
            label="Upcoming Billing"
            value={formatCurrency(stats?.upcomingBilling ?? 0)}
            icon={<Clock size={16} />}
            delta={{ value: 'Next 30 days', positive: true }}
            loading={loading}
            className="sm:col-span-2 lg:col-span-1"
          />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <SpendByCategoryChart data={stats?.spendByCategory ?? []} />
          <StatusDonutChart data={stats?.contractStatusBreakdown ?? []} />
        </section>

        {/* Obligations Table */}
        <section className="grid grid-cols-1 gap-4">
          <ObligationsTable obligations={stats?.recentObligations ?? []} />
        </section>
      </div>
    </DashboardLayout>
  );
}

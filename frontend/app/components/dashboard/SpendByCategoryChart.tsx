'use client';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface SpendByCategoryChartProps {
  data: { category: string; amount: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="font-semibold text-[var(--text-primary)] mb-1">{label}</p>
      <p className="text-[var(--brand)]">${(payload[0].value / 1000).toFixed(0)}k</p>
    </div>
  );
};

export function SpendByCategoryChart({ data }: SpendByCategoryChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Spend by Category</CardTitle>
        <span className="label-muted">This year</span>
      </CardHeader>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${v / 1000}k`}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="amount" fill="#18181B" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

'use client';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS: Record<string, string> = {
  Active:   '#18181B', // Zinc 900
  Expiring: '#F59E0B', // Amber 500
  Expired:  '#EF4444', // Red 500
  Draft:    '#8C886B',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="font-semibold text-[var(--text-primary)]">{payload[0].name}</p>
      <p className="text-[var(--text-muted)]">{payload[0].value} contracts</p>
    </div>
  );
};

export function StatusDonutChart({ data }: { data: { status: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Status</CardTitle>
        <span className="label-muted">All time</span>
      </CardHeader>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={COLORS[entry.status] ?? '#8C886B'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{value}</span>
            )}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

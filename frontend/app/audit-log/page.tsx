'use client';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { AUDIT_LOGS } from '@/app/lib/dummy-data';
import { formatDate } from '@/app/lib/utils';
import { Download } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  'contract.created':  'text-[var(--brand)]',
  'contract.updated':  'text-[var(--risk-medium)]',
  'contract.archived': 'text-[var(--text-muted)]',
  'obligation.completed': 'text-[var(--brand)]',
  'obligation.updated':   'text-[var(--risk-medium)]',
  'vendor.created':    'text-[var(--brand)]',
  'alert.sent':        'text-[var(--text-muted)]',
};

function exportCSV() {
  const headers = ['Timestamp', 'User', 'Action', 'Entity', 'Old Value', 'New Value'];
  const rows = AUDIT_LOGS.map((log) => [
    log.createdAt, log.user, log.action, `${log.entityType}: ${log.entityName}`,
    log.oldValue ?? '', log.newValue ?? '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'termly-audit-log.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AuditLogPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading text-xl">Audit Log</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Immutable record of all system and user actions</p>
        </div>
        <Button variant="ghost" size="sm" onClick={exportCSV}>
          <Download size={13} /> Export CSV
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead className="border-b border-[var(--border)]">
              <tr>
                {['Timestamp', 'User', 'Action', 'Entity', 'Old Value', 'New Value'].map((h) => (
                  <th key={h} className="label-muted text-left px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...AUDIT_LOGS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((log, i) => (
                <tr key={log.id} className={`border-b border-[var(--border)] ${i % 2 === 1 ? 'bg-[var(--surface-deep)]' : ''}`}>
                  <td className="px-5 py-3 text-[var(--text-muted)] font-mono whitespace-nowrap">{log.createdAt.replace('T', ' ').replace('Z', '')}</td>
                  <td className="px-5 py-3 text-[var(--text-primary)] whitespace-nowrap">{log.user}</td>
                  <td className={`px-5 py-3 font-semibold whitespace-nowrap ${ACTION_COLORS[log.action] ?? 'text-[var(--text-primary)]'}`}>{log.action}</td>
                  <td className="px-5 py-3 text-[var(--text-muted)] max-w-[160px] truncate">{log.entityType}: {log.entityName}</td>
                  <td className="px-5 py-3 font-mono text-[11px] text-[var(--text-muted)] max-w-[140px] truncate">{log.oldValue ?? '—'}</td>
                  <td className="px-5 py-3 font-mono text-[11px] text-[var(--text-muted)] max-w-[140px] truncate">{log.newValue ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

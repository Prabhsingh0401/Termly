'use client';
import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { formatDate } from '@/app/lib/utils';
import { Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const PAGE_LIMIT = 25;

const ACTION_COLORS: Record<string, string> = {
  'contract.created':     'text-[var(--brand)]',
  'contract.updated':     'text-[var(--risk-medium)]',
  'contract.archived':    'text-[var(--text-muted)]',
  'obligation.completed': 'text-[var(--brand)]',
  'obligation.updated':   'text-[var(--risk-medium)]',
  'vendor.created':       'text-[var(--brand)]',
  'alert.sent':           'text-[var(--text-muted)]',
};

export default function AuditLogPage() {
  const [logs, setLogs]     = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('termly_token');
      const res = await axios.get(`${API_BASE}/audit-logs`, {
        params: { page: p, limit: PAGE_LIMIT },
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
      setPage(res.data.page ?? p);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  function exportCSV() {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Old Value', 'New Value'];
    const rows = logs.map((log) => [
      log.created_at,
      log.user_name ?? log.user_email ?? '',
      log.action,
      log.entity_type ?? '',
      log.entity_id ?? '',
      log.old_value != null ? JSON.stringify(log.old_value) : '',
      log.new_value != null ? JSON.stringify(log.new_value) : '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'termly-audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const formatValue = (val: any) => {
    if (val == null) return '—';
    if (typeof val !== 'object') return String(val);
    if (Array.isArray(val)) return val.join(', ');
    return Object.entries(val)
      .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
      .join(', ');
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading text-xl">Audit Log</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Immutable record of all system and user actions
            {total > 0 && <span className="ml-2 text-[var(--brand)] font-medium">({total.toLocaleString()} total)</span>}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={exportCSV} disabled={logs.length === 0}>
          <Download size={13} /> Export CSV
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-[var(--text-muted)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading audit log…</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">No audit events yet</p>
            <p className="text-xs text-[var(--text-muted)]">Actions taken by your team will appear here.</p>
          </div>
        ) : (
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
                {logs.map((log, i) => (
                  <tr
                    key={log.id}
                    className={`border-b border-[var(--border)] ${i % 2 === 1 ? 'bg-[var(--surface-deep)]' : ''}`}
                  >
                    <td className="px-5 py-3 text-[var(--text-muted)] font-mono whitespace-nowrap">
                      {new Date(log.created_at).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-primary)] whitespace-nowrap">
                      {log.user_name ?? log.user_email ?? <span className="text-[var(--text-muted)] italic">system</span>}
                    </td>
                    <td className={`px-5 py-3 font-semibold whitespace-nowrap ${ACTION_COLORS[log.action] ?? 'text-[var(--text-primary)]'}`}>
                      {log.action}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-muted)] max-w-[160px] truncate">
                      {log.entity_type}{log.entity_id ? `: ${log.entity_id.slice(0, 8)}…` : ''}
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--text-muted)] max-w-[200px] truncate">
                      {formatValue(log.old_value)}
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--text-muted)] max-w-[200px] truncate">
                      {formatValue(log.new_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--text-muted)]">
              Page {page} of {totalPages} · {total.toLocaleString()} events
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-deep)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-deep)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

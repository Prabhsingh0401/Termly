'use client';
import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { RiskBadge, StatusBadge } from '@/app/components/ui/Badge';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { CONTRACTS } from '@/app/lib/dummy-data';
import { formatCurrency, formatDate, cn } from '@/app/lib/utils';
import { Upload, Filter, Download, ArrowUpDown, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type SortKey = 'vendorName' | 'value' | 'endDate' | 'status' | 'aiRiskScore';
type SortDir = 'asc' | 'desc';

const STATUS_FILTERS = ['all', 'active', 'expiring', 'draft', 'expired', 'terminated'];
const RISK_FILTERS = ['all', 'low', 'medium', 'high'];

export default function ContractsPage() {
  const router = useRouter();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'endDate', dir: 'asc' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  const handleSort = (key: SortKey) => {
    setSort((prev) => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sort.key !== col) return <ArrowUpDown size={12} className="opacity-30" />;
    return sort.dir === 'asc' ? <ChevronUp size={12} className="text-[var(--brand)]" /> : <ChevronDown size={12} className="text-[var(--brand)]" />;
  };

  let filtered = CONTRACTS.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterRisk !== 'all' && c.aiRiskScore !== filterRisk) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'value') return (a.value - b.value) * dir;
    if (sort.key === 'endDate') return (new Date(a.endDate).getTime() - new Date(b.endDate).getTime()) * dir;
    return a[sort.key].localeCompare(b[sort.key]) * dir;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  const ColHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <th
      className="label-muted text-left px-5 py-3 whitespace-nowrap cursor-pointer select-none hover:text-[var(--brand)] transition-colors"
      onClick={() => handleSort(sortKey)}
    >
      <span className="flex items-center gap-1">{label} <SortIcon col={sortKey} /></span>
    </th>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading text-xl">Contracts</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{CONTRACTS.length} total contracts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)}>
            <Filter size={14} /> Filter
            {(filterStatus !== 'all' || filterRisk !== 'all') && (
              <span className="w-4 h-4 bg-[var(--brand)] text-white text-[10px] rounded-full flex items-center justify-center">!</span>
            )}
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/upload')}>
            <Upload size={14} /> Upload Contract
          </Button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="glass-card p-3 mb-4 flex items-center gap-3 animate-[slideInUp_150ms_ease]">
          <span className="text-sm font-medium text-[var(--brand)]">{selected.size} selected</span>
          <Button variant="ghost" size="sm"><Download size={13} /> Export</Button>
          <Button variant="destructive" size="sm">Archive</Button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={16} /></button>
        </div>
      )}

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No contracts found"
            description="Try adjusting your filters or upload your first contract."
            ctaLabel="Upload Contract"
            onCta={() => router.push('/upload')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="accent-[var(--brand)] w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <ColHeader label="Vendor / Contract" sortKey="vendorName" />
                  <ColHeader label="Value" sortKey="value" />
                  <ColHeader label="Expiry Date" sortKey="endDate" />
                  <ColHeader label="Status" sortKey="status" />
                  <ColHeader label="Risk Score" sortKey="aiRiskScore" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className={cn(
                      'table-row-hover border-b border-[var(--border)] transition-colors cursor-pointer',
                      i % 2 === 1 && 'bg-[var(--surface-deep)]',
                      selected.has(c.id) && 'bg-[var(--brand-muted)]',
                    )}
                    onClick={() => router.push(`/contracts/${c.id}`)}
                  >
                    <td className="px-5 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(c.id); }}>
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => {}} className="accent-[var(--brand)] w-4 h-4 cursor-pointer" />
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-[var(--text-primary)] truncate max-w-[200px]">{c.title}</p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{c.vendorName}</p>
                    </td>
                    <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{formatCurrency(c.value, c.currency)}</td>
                    <td className="px-5 py-3 text-[var(--text-muted)] whitespace-nowrap">{formatDate(c.endDate)}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3"><RiskBadge risk={c.aiRiskScore} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Filter Drawer */}
      {drawerOpen && (
        <>
          <div className="modal-backdrop fixed inset-0 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 z-50 glass-card rounded-none rounded-l-[16px] p-6 animate-[slideInRight_200ms_ease] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[var(--text-primary)]">Filters</h3>
              <button onClick={() => setDrawerOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={18} /></button>
            </div>

            <div className="mb-5">
              <p className="label-muted mb-3">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      filterStatus === s
                        ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]'
                    )}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-[var(--border)] my-4" />

            <div className="mb-5">
              <p className="label-muted mb-3">Risk Score</p>
              <div className="flex flex-wrap gap-2">
                {RISK_FILTERS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilterRisk(r)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      filterRisk === r
                        ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]'
                    )}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-[var(--border)] my-4" />

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setFilterStatus('all'); setFilterRisk('all'); }} className="flex-1">Reset</Button>
              <Button variant="primary" size="sm" onClick={() => setDrawerOpen(false)} className="flex-1">Apply</Button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

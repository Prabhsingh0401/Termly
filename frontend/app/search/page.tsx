'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { RiskBadge, StatusBadge } from '@/app/components/ui/Badge';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { CONTRACTS } from '@/app/lib/dummy-data';
import { formatCurrency, formatDate, cn } from '@/app/lib/utils';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  const results = CONTRACTS.filter((c) => {
    const q = query.toLowerCase();
    const matchQ = !q || c.title.toLowerCase().includes(q) || c.vendorName.toLowerCase().includes(q) || c.aiSummary.toLowerCase().includes(q);
    const matchS = filterStatus === 'all' || c.status === filterStatus;
    const matchR = filterRisk === 'all' || c.aiRiskScore === filterRisk;
    return matchQ && matchS && matchR;
  });

  function highlight(text: string, q: string) {
    if (!q) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return <span>{parts.map((p, i) => p.toLowerCase() === q.toLowerCase() ? <mark key={i} className="bg-[var(--text-primary)] text-[var(--bg)] px-0.5 rounded">{p}</mark> : p)}</span>;
  }

  return (
    <DashboardLayout>
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contracts, vendors, clauses…"
            autoFocus
            className="w-full pl-11 pr-20 py-3.5 text-[15px] glass-card border border-[var(--border)] focus:border-[var(--brand)] focus:outline-none rounded-card text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] font-mono bg-[var(--surface-deep)] px-2 py-0.5 rounded border border-[var(--border)]">⌘K</span>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Left filter sidebar */}
        <aside className="w-56 flex-shrink-0">
          <Card className="p-4">
            <p className="label-muted mb-3 flex items-center gap-1"><SlidersHorizontal size={11} /> Filters</p>

            <div className="mb-4">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">Status</p>
              <ul className="space-y-1">
                {['all', 'active', 'expiring', 'draft', 'expired'].map((s) => (
                  <li key={s}>
                    <button
                      onClick={() => setFilterStatus(s)}
                      className={cn(
                        'w-full text-left text-xs px-2 py-1.5 rounded-btn transition-colors',
                        filterStatus === s ? 'bg-[var(--brand-muted)] text-[var(--brand)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px bg-[var(--border)] my-3" />

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">Risk Score</p>
              <ul className="space-y-1">
                {['all', 'low', 'medium', 'high'].map((r) => (
                  <li key={r}>
                    <button
                      onClick={() => setFilterRisk(r)}
                      className={cn(
                        'w-full text-left text-xs px-2 py-1.5 rounded-btn transition-colors',
                        filterRisk === r ? 'bg-[var(--brand-muted)] text-[var(--brand)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {(filterStatus !== 'all' || filterRisk !== 'all') && (
              <button
                onClick={() => { setFilterStatus('all'); setFilterRisk('all'); }}
                className="mt-4 flex items-center gap-1 text-xs text-[var(--brand)] hover:underline"
              >
                <X size={11} /> Clear filters
              </button>
            )}
          </Card>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {query === '' && filterStatus === 'all' && filterRisk === 'all' ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <Search size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">Start typing to search contracts, vendors, and clauses</p>
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title="No contracts match your search"
              description={`No results for "${query}". Try different keywords or adjust your filters.`}
              ctaLabel="Clear filters"
              onCta={() => { setQuery(''); setFilterStatus('all'); setFilterRisk('all'); }}
            />
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-muted)] mb-2">{results.length} result{results.length !== 1 ? 's' : ''}</p>
              {results.map((c) => (
                <Card key={c.id} hoverable onClick={() => router.push(`/contracts/${c.id}`)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--text-primary)] truncate">{highlight(c.title, query)}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{highlight(c.vendorName, query)} · Expires {formatDate(c.endDate)}</p>
                      {query && c.aiSummary.toLowerCase().includes(query.toLowerCase()) && (
                        <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2">{highlight(c.aiSummary, query)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={c.status} />
                      <RiskBadge risk={c.aiRiskScore} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

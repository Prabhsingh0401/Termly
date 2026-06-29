'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { RiskBadge, StatusBadge } from '@/app/components/ui/Badge';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { formatCurrency, formatDate, cn } from '@/app/lib/utils';
import { Upload, Filter, Download, ArrowUpDown, ChevronUp, ChevronDown, X, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toast } from '@/app/components/ui/Toast';

type SortKey = 'vendorName' | 'value' | 'endDate' | 'status' | 'aiRiskScore';
type SortDir = 'asc' | 'desc';

const STATUS_FILTERS = ['all', 'active', 'expiring', 'draft', 'expired', 'terminated'];
const RISK_FILTERS = ['all', 'low', 'medium', 'high'];

export default function BillsPage() {
  const router = useRouter();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'endDate', dir: 'asc' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    axios
      .get('/contracts', { params: { document_type: 'bill' } })
      .then((r) => {
        setBills(r.data.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Termly - Bills Export', 14, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(`Total bills exported: ${selected.size}`, 14, 33);
      
      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 37, 196, 37);
      
      let y = 46;
      const selectedBills = bills.filter((c) => selected.has(c.id));
      
      selectedBills.forEach((c) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(c.title || 'Untitled Bill', 14, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const vendor = c.vendorName || c.vendor_name || 'N/A';
        const val = formatCurrency(c.value, c.currency);
        const expiry = formatDate(c.endDate || c.end_date);
        const status = (c.status || 'draft').toUpperCase();
        const risk = (c.aiRiskScore || c.ai_risk_score || 'N/A').toUpperCase();
        
        doc.text(`Merchant: ${vendor}  |  Amount: ${val}`, 14, y + 5);
        doc.text(`Due Date: ${expiry}  |  Status: ${status}  |  Risk: ${risk}`, 14, y + 10);
        
        y += 15;
        doc.setDrawColor(230, 230, 230);
        doc.line(14, y, 196, y);
        y += 7;
      });
      
      doc.save(`termly-bills-export-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  const handleDeleteBills = async () => {
    try {
      await Promise.all(
        Array.from(selected).map((id) => axios.delete(`/contracts/${id}`))
      );
      setBills((prev) => prev.filter((c) => !selected.has(c.id)));
      setSelected(new Set());
      setToast({ message: 'Selected bill(s) deleted successfully.', type: 'success' });
    } catch (err) {
      console.error('Failed to delete bills:', err);
      setToast({ message: 'Failed to delete selected bill(s).', type: 'error' });
    }
  };

  const handleSort = (key: SortKey) => {
    setSort((prev) => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sort.key !== col) return <ArrowUpDown size={12} className="opacity-30" />;
    return sort.dir === 'asc' ? <ChevronUp size={12} className="text-[var(--brand)]" /> : <ChevronDown size={12} className="text-[var(--brand)]" />;
  };

  let filtered = bills.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    const risk = c.aiRiskScore || c.ai_risk_score;
    if (filterRisk !== 'all' && risk !== filterRisk) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'value') return ((parseFloat(a.value) || 0) - (parseFloat(b.value) || 0)) * dir;
    if (sort.key === 'endDate') {
      const dateA = new Date(a.endDate || a.end_date || 0).getTime();
      const dateB = new Date(b.endDate || b.end_date || 0).getTime();
      return (dateA - dateB) * dir;
    }
    const keyMap: Record<string, string> = {
      vendorName: 'vendor_name',
      aiRiskScore: 'ai_risk_score',
    };
    const mappedKey = keyMap[sort.key] || sort.key;
    const valA = a[sort.key] ?? a[mappedKey] ?? '';
    const valB = b[sort.key] ?? b[mappedKey] ?? '';
    return valA.toString().localeCompare(valB.toString()) * dir;
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
      <div className="pb-28 md:pb-6 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="heading text-xl">Bills & Invoices</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{bills.length} total bills</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)} className="flex-1 sm:flex-initial">
              <Filter size={14} className="mr-1.5 inline" /> Filter
              {(filterStatus !== 'all' || filterRisk !== 'all') && (
                <span className="ml-1.5 w-4 h-4 bg-[var(--brand)] text-white text-[10px] rounded-full flex items-center justify-center inline-flex">!</span>
              )}
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push('/upload?type=bill')} className="flex-1 sm:flex-initial">
              <Upload size={14} className="mr-1.5 inline" /> Upload Bill
            </Button>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="glass-card p-3 mb-4 flex items-center gap-3 animate-[slideInUp_150ms_ease]">
            <span className="text-sm font-medium text-[var(--brand)]">{selected.size} selected</span>
            <Button variant="ghost" size="sm" onClick={handleExportPDF}><Download size={13} className="mr-1.5 inline" /> Export PDF</Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteBills}><Trash size={13} className="mr-1.5 inline" /> Delete</Button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={16} /></button>
          </div>
        )}

        {/* Table */}
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse bg-[var(--surface-deep)] rounded mb-2" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No bills found"
              description="Try adjusting your filters or upload your first bill/invoice."
              ctaLabel="Upload Bill"
              onCta={() => router.push('/upload?type=bill')}
            />
          ) : (
            <>
              {/* Mobile Card List (visible on small screens) */}
              <div className="block md:hidden divide-y divide-[var(--border)]">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      'p-4 flex flex-col gap-2.5 transition-colors cursor-pointer active:bg-[var(--brand-muted)]',
                      selected.has(c.id) && 'bg-[var(--brand-muted)]'
                    )}
                    onClick={() => router.push(`/bills/${c.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleSelect(c.id); }}
                        className="pt-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(c.id)}
                          onChange={() => {}}
                          className="accent-[var(--brand)] w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate">{c.title}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{c.vendorName || c.vendor_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 pl-7">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {formatCurrency(c.value, c.currency)}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          Due {formatDate(c.endDate || c.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={c.status} />
                        <RiskBadge risk={c.aiRiskScore || c.ai_risk_score} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (visible on md screens and above) */}
              <div className="hidden md:block overflow-x-auto">
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
                      <ColHeader label="Vendor / Bill Name" sortKey="vendorName" />
                      <ColHeader label="Value" sortKey="value" />
                      <ColHeader label="Due Date" sortKey="endDate" />
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
                        onClick={() => router.push(`/bills/${c.id}`)}
                      >
                        <td className="px-5 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(c.id); }}>
                          <input type="checkbox" checked={selected.has(c.id)} onChange={() => {}} className="accent-[var(--brand)] w-4 h-4 cursor-pointer" />
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-[var(--text-primary)] truncate max-w-[200px]">{c.title}</p>
                          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{c.vendorName || c.vendor_name}</p>
                        </td>
                        <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{formatCurrency(c.value, c.currency)}</td>
                        <td className="px-5 py-3 text-[var(--text-muted)] whitespace-nowrap">{formatDate(c.endDate || c.end_date)}</td>
                        <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-5 py-3"><RiskBadge risk={c.aiRiskScore || c.ai_risk_score} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </DashboardLayout>
  );
}

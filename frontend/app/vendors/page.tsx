'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { RiskBadge } from '@/app/components/ui/Badge';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { formatCurrency, cn } from '@/app/lib/utils';
import { Plus, Globe, X, AlertTriangle, Trash } from 'lucide-react';
import { Toast } from '@/app/components/ui/Toast';

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    name: '',
    category: '',
    country: '',
    contactEmail: '',
    riskScore: '',
  });

  const fetchVendors = () => {
    setLoading(true);
    axios
      .get('/vendors')
      .then((r) => {
        setVendors(r.data.data ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch vendors:', err);
        setLoading(false);
      });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === vendors.length) setSelected(new Set());
    else setSelected(new Set(vendors.map((v) => v.id)));
  };

  const handleDeleteVendors = async () => {
    try {
      await Promise.all(
        Array.from(selected).map((id) => axios.delete(`/vendors/${id}`))
      );
      setVendors((prev) => prev.filter((v) => !selected.has(v.id)));
      setSelected(new Set());
      setToast({ message: 'Selected vendor(s) deleted successfully.', type: 'success' });
    } catch (err) {
      console.error('Failed to delete vendors:', err);
      setToast({ message: 'Failed to delete selected vendor(s).', type: 'error' });
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await axios.post('/vendors', {
        name: form.name.trim(),
        category: form.category.trim() || null,
        country: form.country.trim() || null,
        contact_email: form.contactEmail.trim() || null,
        risk_score: form.riskScore || null,
      });

      setIsModalOpen(false);
      setForm({
        name: '',
        category: '',
        country: '',
        contactEmail: '',
        riskScore: '',
      });
      fetchVendors();
    } catch (err: any) {
      console.error('Failed to create vendor:', err);
      setError(err.response?.data?.error || 'Failed to save vendor. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="pb-28 md:pb-6 max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="heading text-xl">Vendors</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{vendors.length} vendors tracked</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Plus size={14} className="mr-1.5 inline" /> Add Vendor
          </Button>
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="glass-card p-3 mb-4 flex items-center gap-3 animate-[slideInUp_150ms_ease]">
            <span className="text-sm font-medium text-[var(--brand)]">{selected.size} selected</span>
            <Button variant="destructive" size="sm" onClick={handleDeleteVendors}><Trash size={13} className="mr-1.5 inline" /> Delete</Button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={16} /></button>
          </div>
        )}

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
              onCta={() => setIsModalOpen(true)}
            />
          ) : (
            <>
              {/* Mobile Card List View (visible on small screens) */}
              <div className="block md:hidden divide-y divide-[var(--border)]">
                {vendors.map((v) => (
                  <div
                    key={v.id}
                    className={cn(
                      'p-4 flex flex-col gap-2.5 transition-colors cursor-pointer active:bg-[var(--brand-muted)]',
                      selected.has(v.id) && 'bg-[var(--brand-muted)]'
                    )}
                    onClick={() => router.push(`/vendors/${v.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleSelect(v.id); }}
                        className="pt-1"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(v.id)}
                          onChange={() => {}}
                          className="accent-[var(--brand)] w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-badge bg-[var(--brand-muted)] flex items-center justify-center text-[var(--brand)] font-bold text-xs flex-shrink-0">
                            {v.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--text-primary)] truncate">{v.name}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{v.category || 'No Category'}</p>
                          </div>
                        </div>
                      </div>
                      <RiskBadge risk={v.risk_score} />
                    </div>

                    <div className="flex items-center justify-between mt-1 pl-11">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-[var(--text-primary)]">
                          {v.active_contract_count ?? 0} active contract{v.active_contract_count !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                          <Globe size={10} /> {v.country || '—'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[var(--brand)]">
                        {formatCurrency(v.total_spend ?? 0)}
                      </span>
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
                          checked={selected.size === vendors.length && vendors.length > 0}
                          onChange={toggleAll}
                          className="accent-[var(--brand)] w-4 h-4 cursor-pointer"
                        />
                      </th>
                      {['Vendor', 'Category', 'Country', 'Risk Score', 'Active Contracts', 'Total Spend'].map((h) => (
                        <th key={h} className="label-muted text-left px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v, i) => (
                      <tr
                        key={v.id}
                        className={cn(
                          'table-row-hover border-b border-[var(--border)] cursor-pointer transition-colors',
                          i % 2 === 1 && 'bg-[var(--surface-deep)]',
                          selected.has(v.id) && 'bg-[var(--brand-muted)]'
                        )}
                        onClick={() => router.push(`/vendors/${v.id}`)}
                      >
                        <td className="px-5 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(v.id); }}>
                          <input type="checkbox" checked={selected.has(v.id)} onChange={() => {}} className="accent-[var(--brand)] w-4 h-4 cursor-pointer" />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-badge bg-[var(--brand-muted)] flex items-center justify-center text-[var(--brand)] font-bold text-xs flex-shrink-0">
                              {v.name.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="font-medium text-[var(--text-primary)]">{v.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[var(--text-muted)]">{v.category || '—'}</td>
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1 text-[var(--text-muted)]">
                            <Globe size={12} />
                            {v.country || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <RiskBadge risk={v.risk_score} />
                        </td>
                        <td className="px-5 py-3 text-[var(--text-primary)] font-medium">{v.active_contract_count ?? 0}</td>
                        <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{formatCurrency(v.total_spend ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>

        {/* Add Vendor Glass Drawer */}
        {isModalOpen && (
          <>
            <div className="modal-backdrop fixed inset-0 z-40 bg-[#1E1702]/45 backdrop-blur-[3px] animate-[fadeIn_200ms_ease]" onClick={() => { setIsModalOpen(false); setError(null); setForm({ name: '', category: '', country: '', contactEmail: '', riskScore: '' }); }} />
            <div className="fixed right-0 top-0 h-full w-[400px] max-w-[100vw] z-50 glass-card rounded-none rounded-l-[16px] p-6 overflow-y-auto animate-[slideInRight_200ms_ease] border-l border-[var(--border)]">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setError(null);
                  setForm({ name: '', category: '', country: '', contactEmail: '', riskScore: '' });
                }}
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors focus:outline-none"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <h3 className="heading text-[18px] mb-1">Add New Vendor</h3>
              <p className="text-xs text-[var(--text-muted)] mb-5">Create a vendor profile to track linked contracts and aggregate spend.</p>

              {error && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-badge bg-red-50 border border-red-200 text-red-700">
                  <AlertTriangle size={14} className="shrink-0" />
                  <p className="text-xs font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-muted block mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-badge bg-[var(--surface-deep)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-muted block mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. SaaS, Consulting"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-badge bg-[var(--surface-deep)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="label-muted block mb-1">Country</label>
                    <input
                      type="text"
                      placeholder="e.g. United States"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-badge bg-[var(--surface-deep)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-muted block mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="e.g. accounting@acme.com"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-badge bg-[var(--surface-deep)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>

                <div>
                  <label className="label-muted block mb-1">Initial Risk Score</label>
                  <select
                    value={form.riskScore}
                    onChange={(e) => setForm({ ...form, riskScore: e.target.value })}
                    className="w-full px-3 py-2 rounded-badge bg-[var(--surface-deep)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Not Rated</option>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsModalOpen(false);
                      setError(null);
                      setForm({ name: '', category: '', country: '', contactEmail: '', riskScore: '' });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting} className="flex-1">
                    Save Vendor
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </DashboardLayout>
  );
}

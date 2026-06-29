'use client';
import { useState, useCallback, Suspense } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Toggle } from '@/app/components/ui/Toggle';
import { RiskBadge } from '@/app/components/ui/Badge';
import { cn } from '@/app/lib/utils';
import { Upload, FileText, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { Toast } from '@/app/components/ui/Toast';

type Stage = 'idle' | 'uploading' | 'extracting' | 'done';

interface ExtractedForm {
  title: string;
  vendor: string;
  docType: string;
  value: string;
  currency: string;
  startDate: string;
  endDate: string;
  noticePeriod: string;
  autoRenewal: boolean;
  governingLaw: string;
  paymentTerms: string;
  billingCycle: string;
  riskScore: 'low' | 'medium' | 'high';
  riskJustification: string;
  documentType: 'contract' | 'bill';
}

const EMPTY_FORM: ExtractedForm = {
  title: '',
  vendor: '',
  docType: '',
  value: '',
  currency: 'USD',
  startDate: '',
  endDate: '',
  noticePeriod: '',
  autoRenewal: false,
  governingLaw: '',
  paymentTerms: '',
  billingCycle: '',
  riskScore: 'low',
  riskJustification: '',
  documentType: 'contract',
};

interface UploadJob {
  id: string;
  file: File;
  stage: Stage;
  progress: number;
  error: string | null;
  contractId: string | null;
  s3Uploaded: boolean;
  form: ExtractedForm;
  autoRenewal: boolean;
}

function UploadPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBillQuery = searchParams.get('type') === 'bill';
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const updateJob = useCallback((id: string, updates: Partial<UploadJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  }, []);

  const runExtraction = useCallback(async (id: string, contractId: string) => {
    updateJob(id, { stage: 'extracting', progress: 60, error: null });
    try {
      const res = await axios.post(`/contracts/${contractId}/trigger-extraction`);
      const c = res.data.contract;
      updateJob(id, { progress: 99 });

      if (c) {
        updateJob(id, {
          form: {
            title: c.title || '',
            vendor: c.vendor_name || '',
            docType: c.contract_type || '',
            value: c.value?.toString() || '',
            currency: c.currency || 'USD',
            startDate: c.start_date?.slice(0, 10) || '',
            endDate: c.end_date?.slice(0, 10) || '',
            noticePeriod: c.notice_period_days?.toString() || '',
            autoRenewal: c.auto_renewal || false,
            governingLaw: c.governing_law || '',
            paymentTerms: c.payment_terms || '',
            billingCycle: '',
            riskScore: (c.ai_risk_score as 'low' | 'medium' | 'high') || 'low',
            riskJustification: c.ai_summary || '',
            documentType: c.document_type || (isBillQuery ? 'bill' : 'contract'),
          },
          autoRenewal: c.auto_renewal || false,
          progress: 100,
          stage: 'done',
        });
      } else {
        throw new Error('No data returned from extraction.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'AI Extraction failed.';
      updateJob(id, {
        error: msg,
        stage: 'idle',
      });
      setGlobalError(msg);
    }
  }, [updateJob, isBillQuery]);

  const processFile = useCallback(async (job: UploadJob) => {
    updateJob(job.id, { stage: 'uploading', progress: 0, error: null, s3Uploaded: false });
    try {
      const createRes = await axios.post('/contracts', {
        title: job.file.name.replace('.pdf', ''),
        document_type: isBillQuery ? 'bill' : 'contract',
      });
      const { contractId: newContractId, uploadUrl } = createRes.data;
      updateJob(job.id, { contractId: newContractId });

      const s3Axios = axios.create();
      await s3Axios.put(uploadUrl, job.file, {
        headers: { 'Content-Type': 'application/pdf' },
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded * 60) / e.total) : 30;
          updateJob(job.id, { progress: Math.min(pct, 60) });
        },
      });

      updateJob(job.id, { s3Uploaded: true });
      await runExtraction(job.id, newContractId);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Upload failed.';
      updateJob(job.id, {
        error: msg,
        stage: 'idle',
        progress: 0,
      });
      setGlobalError(msg);
    }
  }, [updateJob, runExtraction, isBillQuery]);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (accepted.length === 0) return;
    const toProcess = accepted.slice(0, 5); // Limit to 5
    
    const newJobs = toProcess.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      stage: 'idle' as Stage,
      progress: 0,
      contractId: null,
      error: null,
      form: {
        ...EMPTY_FORM,
        documentType: isBillQuery ? 'bill' as const : 'contract' as const,
      },
      s3Uploaded: false,
      autoRenewal: false
    }));
    
    // Add new jobs to the end of the existing jobs list
    setJobs(prev => [...prev, ...newJobs]);
    setGlobalError(null);

    // Process them one by one sequentially
    for (const job of newJobs) {
      await processFile(job);
    }
  }, [processFile, isBillQuery]);

  const handleSave = async (job: UploadJob) => {
    if (!job.contractId) return;
    try {
      await axios.patch(`/contracts/${job.contractId}`, {
        title: job.form.title,
        vendor_name: job.form.vendor,
        value: parseFloat(job.form.value) || null,
        end_date: job.form.endDate || null,
        auto_renewal: job.autoRenewal,
        notice_period_days: parseInt(job.form.noticePeriod) || null,
        contract_type: job.form.docType || null,
        currency: job.form.currency,
        ai_risk_score: job.form.riskScore,
        ai_summary: job.form.riskJustification,
        document_type: job.form.documentType,
        status: 'pending',
      });
      
      setJobs(prev => prev.filter(j => j.id !== job.id));
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save contract.';
      updateJob(job.id, { error: msg });
      setGlobalError(msg);
    }
  };

  const handleDiscard = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxSize: 50 * 1024 * 1024, multiple: true, maxFiles: 5
  });

  return (
    <DashboardLayout>
      <div className="pb-28 md:pb-6 max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="heading text-xl">{isBillQuery ? 'Upload Bills & Invoices' : 'Upload Documents'}</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {isBillQuery ? 'AI extracts all key billing details in under 60 seconds. Upload up to 5 files.' : 'AI extracts all key terms in under 60 seconds. Upload up to 5 files at a time.'}
          </p>
        </div>

        {globalError && <Toast message={globalError} onClose={() => setGlobalError(null)} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left — Drop zone + progress list */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6">
            <Card className="p-0 overflow-hidden">
              <div
                {...getRootProps()}
                className={cn(
                  'flex flex-col items-center justify-center p-10 min-h-[200px] cursor-pointer transition-all border-2 border-dashed rounded-card',
                  isDragActive
                    ? 'border-[var(--brand)] bg-[var(--surface-deep)]'
                    : 'border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--surface-deep)]',
                )}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <Upload size={40} className="mx-auto mb-3 text-[var(--text-muted)]" />
                  <p className="font-semibold text-[var(--text-primary)] mb-1">
                    {isBillQuery ? 'Drop your bills or invoices here' : 'Drop your contracts or bills here'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">PDF only · Up to 5 files · Max 50 MB each</p>
                </div>
              </div>
            </Card>

            {jobs.length > 0 && (
              <div className="flex flex-col gap-3">
                {jobs.map(job => (
                  <Card key={job.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[var(--brand)] shrink-0" />
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[200px]" title={job.file.name}>
                          {job.file.name}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[var(--brand)]">{job.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {job.stage === 'idle' ? (job.error ? 'Failed' : 'Waiting in queue...') :
                         job.stage === 'uploading' ? 'Uploading to secure storage…' : 
                         job.stage === 'extracting' ? 'AI analyzing clauses…' : '✅ Extraction complete'}
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--surface-deep)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--brand)] rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    {job.error && (
                      <div className="mt-3 text-xs text-red-600 font-medium">
                        {job.error}
                        <button className="ml-2 underline hover:text-red-700" onClick={(e) => { e.stopPropagation(); processFile(job); }}>Retry</button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right — Extracted forms */}
          <div className="flex flex-col gap-6">
            {jobs.filter(j => j.stage === 'done').length > 0 ? (
              jobs.filter(j => j.stage === 'done').map(job => (
                <div key={job.id} className="flex flex-col gap-4 animate-[fadeIn_300ms_ease] mb-4 pb-8 border-b border-[var(--border)] last:border-0 last:mb-0 last:pb-0">
                  <Card>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-[var(--brand)]" />
                      Extracted: {job.file.name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="label-muted block mb-1">Document Category</label>
                        <select
                          value={job.form.documentType}
                          onChange={(e) => updateJob(job.id, { form: { ...job.form, documentType: e.target.value as 'contract' | 'bill' } })}
                          className="w-full px-3 py-2 rounded-badge bg-[var(--surface-deep)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors"
                        >
                          <option value="contract">Contract (Liabilities/Payables)</option>
                          <option value="bill">Bill / Invoice (Receivables/Incoming)</option>
                        </select>
                      </div>
                      {[
                        { label: 'Contract Title', key: 'title', full: true },
                        { label: 'Vendor / Merchant', key: 'vendor' },
                        { label: 'Document Type', key: 'docType' },
                        { label: 'Value', key: 'value' },
                        { label: 'Currency', key: 'currency' },
                        { label: 'Start Date', key: 'startDate' },
                        { label: 'End Date', key: 'endDate' },
                        { label: 'Notice Period (days)', key: 'noticePeriod' },
                        { label: 'Governing Law', key: 'governingLaw' },
                        { label: 'Payment Terms', key: 'paymentTerms' },
                        { label: 'Billing Cycle', key: 'billingCycle' },
                      ].map(({ label, key, full }) => (
                        <div key={key} className={cn(full ? 'sm:col-span-2' : 'col-span-1')}>
                          <label className="label-muted block mb-1">{label}</label>
                          <input
                            type="text"
                            value={(job.form as any)[key]}
                            onChange={(e) => updateJob(job.id, { form: { ...job.form, [key]: e.target.value } })}
                            className="w-full px-3 py-2 rounded-badge bg-[var(--surface-deep)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors"
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-2 flex items-center gap-4">
                        <label className="label-muted">Auto-Renewal</label>
                        <Toggle checked={job.autoRenewal} onChange={(v) => updateJob(job.id, { autoRenewal: v })} />
                      </div>
                    </div>
                  </Card>

                  {/* Risk Score */}
                  <Card className="bg-[var(--surface-deep)]">
                    <div className="flex items-center gap-3 mb-3">
                      <RiskBadge risk={job.form.riskScore} />
                      <p className="text-sm font-semibold text-[var(--text-primary)]">AI Risk Assessment</p>
                    </div>
                    <p className="text-[13px] text-[var(--text-muted)] italic leading-relaxed">{job.form.riskJustification}</p>
                  </Card>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => handleDiscard(job.id)} className="flex-1">
                      <X size={14} /> Discard
                    </Button>
                    <Button variant="primary" onClick={() => handleSave(job)} className="flex-1">
                      <CheckCircle2 size={14} /> Save Contract
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center text-center p-10 h-full min-h-[300px]">
                <div className="text-[var(--text-muted)]">
                  <FileText size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-medium">Upload documents to see<br />AI-extracted fields here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={null}>
      <UploadPageInner />
    </Suspense>
  );
}

'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Toggle } from '@/app/components/ui/Toggle';
import { RiskBadge } from '@/app/components/ui/Badge';
import { cn } from '@/app/lib/utils';
import { Upload, FileText, CheckCircle2, X, AlertTriangle } from 'lucide-react';

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
};

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState<ExtractedForm>(EMPTY_FORM);
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [contractId, setContractId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [s3Uploaded, setS3Uploaded] = useState(false);

  const runExtraction = async (id: string) => {
    setStage('extracting');
    setProgress(60);
    setError(null);

    try {
      // 1. Trigger AI extraction (awaits completion)
      const res = await axios.post(`/contracts/${id}/trigger-extraction`);
      const c = res.data.contract;

      setProgress(99);

      if (c) {
        setForm({
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
        });
        setAutoRenewal(c.auto_renewal || false);
        setProgress(100);
        setStage('done');
      } else {
        throw new Error('No data returned from extraction.');
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'AI Extraction failed. You can retry below.'
      );
      setStage('idle');
    }
  };

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted[0]) return;
    const droppedFile = accepted[0];
    setFile(droppedFile);
    setStage('uploading');
    setProgress(0);
    setError(null);
    setS3Uploaded(false);

    try {
      // 1. Create contract record + get presigned S3 URL
      const createRes = await axios.post('/contracts', {
        title: droppedFile.name.replace('.pdf', ''),
      });
      const { contractId: newContractId, uploadUrl } = createRes.data;
      setContractId(newContractId);

      // 2. PUT file directly to S3 presigned URL
      const s3Axios = axios.create();
      await s3Axios.put(uploadUrl, droppedFile, {
        headers: { 'Content-Type': 'application/pdf' },
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded * 60) / e.total) : 30;
          setProgress(Math.min(pct, 60));
        },
      });

      setS3Uploaded(true);

      // 3. Trigger extraction
      await runExtraction(newContractId);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Upload failed. Please try again.'
      );
      setStage('idle');
      setProgress(0);
    }
  }, []);

  const handleRetry = async () => {
    if (!contractId) return;
    await runExtraction(contractId);
  };

  const handleSave = async () => {
    if (!contractId) return;
    try {
      await axios.patch(`/contracts/${contractId}`, {
        title: form.title,
        vendor_name: form.vendor,
        value: parseFloat(form.value) || null,
        end_date: form.endDate || null,
        auto_renewal: autoRenewal,
        notice_period_days: parseInt(form.noticePeriod) || null,
        contract_type: form.docType || null,
        currency: form.currency,
        ai_risk_score: form.riskScore,
        ai_summary: form.riskJustification,
        status: 'pending',
      });
      router.push('/contracts');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save contract.');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxSize: 50 * 1024 * 1024, multiple: false,
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="heading text-xl">Upload Document</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">AI extracts all key terms in under 60 seconds</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-center gap-3 p-4 rounded-card bg-red-50 border border-red-200 text-red-700">
            <AlertTriangle size={16} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Left — Drop zone + progress */}
          <div className="flex flex-col gap-4">
            <Card className="p-0 overflow-hidden">
              <div
                {...getRootProps()}
                className={cn(
                  'flex flex-col items-center justify-center p-10 min-h-[280px] cursor-pointer transition-all border-2 border-dashed rounded-card',
                  isDragActive
                    ? 'border-[var(--brand)] bg-[var(--surface-deep)]'
                    : 'border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--surface-deep)]',
                )}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div 
                    className="text-center"
                    onClick={(e) => {
                      if (s3Uploaded && stage === 'idle') {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <FileText size={40} className="mx-auto mb-3 text-[var(--brand)]" />
                    <p className="font-semibold text-[var(--text-primary)]">{file.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    
                    {s3Uploaded && stage === 'idle' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetry();
                        }}
                        className="mt-4"
                      >
                        Retry AI Extraction
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={40} className="mx-auto mb-3 text-[var(--text-muted)]" />
                    <p className="font-semibold text-[var(--text-primary)] mb-1">Drop your contract or bill here</p>
                    <p className="text-xs text-[var(--text-muted)]">PDF only · Max 50 MB</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Progress */}
            {stage !== 'idle' && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {stage === 'uploading' ? 'Uploading to S3…' : stage === 'extracting' ? 'AI Extracting clauses…' : '✅ Extraction complete'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {stage === 'uploading' ? 'Sending file to secure storage' : stage === 'extracting' ? 'Claude 3 Sonnet analyzing' : 'Review and save below'}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--brand)]">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--surface-deep)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--brand)] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Right — Extracted form */}
          {stage === 'done' ? (
            <div className="flex flex-col gap-4 animate-[fadeIn_300ms_ease]">
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-5">AI-Extracted Details</h3>
                <div className="grid grid-cols-2 gap-4">
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
                    <div key={key} className={cn(full && 'col-span-2')}>
                      <label className="label-muted block mb-1">{label}</label>
                      <input
                        type="text"
                        value={(form as any)[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-badge bg-[var(--surface-deep)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors"
                      />
                    </div>
                  ))}
                  <div className="col-span-2 flex items-center gap-4">
                    <label className="label-muted">Auto-Renewal</label>
                    <Toggle checked={autoRenewal} onChange={(v) => { setAutoRenewal(v); setForm((f) => ({ ...f, autoRenewal: v })); }} />
                  </div>
                </div>
              </Card>

              {/* Risk Score */}
              <Card className="bg-[var(--surface-deep)]">
                <div className="flex items-center gap-3 mb-3">
                  <RiskBadge risk={form.riskScore} />
                  <p className="text-sm font-semibold text-[var(--text-primary)]">AI Risk Assessment</p>
                </div>
                <p className="text-[13px] text-[var(--text-muted)] italic leading-relaxed">{form.riskJustification}</p>
              </Card>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => { setStage('idle'); setFile(null); setProgress(0); setError(null); setContractId(null); setS3Uploaded(false); }} className="flex-1">
                  <X size={14} /> Discard
                </Button>
                <Button variant="primary" onClick={handleSave} className="flex-1">
                  <CheckCircle2 size={14} /> Save Contract
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center text-center p-10">
              <div className="text-[var(--text-muted)]">
                <FileText size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm font-medium">Upload a document to see<br />AI-extracted fields here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

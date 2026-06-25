'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Toggle } from '@/app/components/ui/Toggle';
import { RiskBadge } from '@/app/components/ui/Badge';
import { cn } from '@/app/lib/utils';
import { Upload, FileText, CheckCircle2, X } from 'lucide-react';

const DUMMY_EXTRACTED = {
  title: 'Salesforce CRM Enterprise License — Renewal 2027',
  vendor: 'Salesforce Inc.',
  docType: 'Contract',
  value: '52000',
  currency: 'USD',
  startDate: '2027-01-01',
  endDate: '2028-01-01',
  noticePeriod: '60',
  autoRenewal: true,
  governingLaw: 'California, USA',
  paymentTerms: 'Annual upfront',
  billingCycle: 'Annual',
  riskScore: 'medium' as const,
  riskJustification: 'Standard SaaS agreement with moderate auto-renewal risk. The 60-day notice period is within acceptable range, however the price escalation clause of up to 6% per year represents a medium financial exposure over the 3-year term.',
};

type Stage = 'idle' | 'uploading' | 'extracting' | 'done';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState(DUMMY_EXTRACTED);
  const [autoRenewal, setAutoRenewal] = useState(DUMMY_EXTRACTED.autoRenewal);

  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted[0]) return;
    setFile(accepted[0]);
    setStage('uploading');
    setProgress(0);

    // Simulate upload + extraction
    const uploadInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 60) { clearInterval(uploadInterval); setStage('extracting'); return 60; }
        return p + 6;
      });
    }, 120);

    setTimeout(() => {
      const extractInterval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { clearInterval(extractInterval); setStage('done'); return 100; }
          return p + 4;
        });
      }, 80);
    }, 1400);
  }, []);

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
                  <div className="text-center">
                    <FileText size={40} className="mx-auto mb-3 text-[var(--brand)]" />
                    <p className="font-semibold text-[var(--text-primary)]">{file.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                      {stage === 'uploading' ? 'Textract OCR processing' : stage === 'extracting' ? 'Claude 3 Sonnet analyzing' : 'Review and save below'}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--brand)]">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--surface-deep)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--brand)] rounded-full transition-all duration-150"
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
                    <Toggle checked={autoRenewal} onChange={setAutoRenewal} />
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
                <Button variant="ghost" onClick={() => { setStage('idle'); setFile(null); setProgress(0); }} className="flex-1">
                  <X size={14} /> Discard
                </Button>
                <Button variant="primary" onClick={() => router.push('/contracts')} className="flex-1">
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

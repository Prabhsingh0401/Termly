'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/app/components/ui/Button';
import { cn } from '@/app/lib/utils';
import { Upload, Building2, BarChart3, Check } from 'lucide-react';
import { useAuth } from '@/app/components/providers/AuthProvider';
import axios from 'axios';

const PLANS = [
  { id: 'free', name: 'Free', price: '$0/mo', features: ['Up to 5 contracts', '1 user', 'Email alerts'] },
  { id: 'pro',  name: 'Pro',  price: '$99/mo', features: ['Unlimited contracts', 'Up to 20 users', 'AI extraction', 'Approval workflows'] },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState('');
  const [plan, setPlan] = useState('pro');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'idle' | 'processing' | 'done'>('idle');
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted[0]) return;
    setFile(accepted[0]);
    setStage('processing');
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(iv); setStage('done'); return 100; }
        return p + 5;
      });
    }, 100);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxSize: 50 * 1024 * 1024, multiple: false,
  });

  const canContinue = [
    orgName.trim().length > 0,
    true,
    true,
  ][step];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === step ? 'w-6 bg-[var(--brand)]' : i < step ? 'w-2 bg-[var(--brand)] opacity-40' : 'w-2 bg-[var(--border)]'
            )}
          />
        ))}
      </div>

      {/* Step card */}
      <div className="glass-card p-8 w-full max-w-4xl animate-[fadeIn_200ms_ease]">
        {/* Step 1 — Create Org */}
        {step === 0 && (
          <>
            <div className="w-12 h-12 rounded-card bg-[var(--brand-muted)] flex items-center justify-center mb-5">
              <Building2 size={24} className="text-[var(--brand)]" />
            </div>
            <h1 className="heading text-2xl mb-1">Create your organisation</h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">You can invite team members after setup.</p>

            {error && (
              <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50">
                {error}
              </div>
            )}

            <div className="mb-5">
              <label className="label-muted block mb-2">Organisation Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full px-3 py-2.5 rounded-badge border border-[var(--border)] bg-[var(--surface-deep)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="label-muted block mb-3">Choose a Plan</label>
              <div className="grid grid-cols-2 gap-3">
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    className={cn(
                      'p-4 rounded-card text-left border-2 transition-all',
                      plan === p.id ? 'border-[var(--brand)] bg-[var(--brand-muted)]' : 'border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--brand-muted)]'
                    )}
                  >
                    <p className="font-bold text-[var(--text-primary)]">{p.name}</p>
                    <p className="text-[var(--brand)] text-sm font-semibold">{p.price}</p>
                    <ul className="mt-2 space-y-1">
                      {p.features.map((f) => (
                        <li key={f} className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                          <Check size={10} className="text-[var(--brand)]" />{f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 2 — Upload */}
        {step === 1 && (
          <>
            <div className="w-12 h-12 rounded-card bg-[var(--brand-muted)] flex items-center justify-center mb-5">
              <Upload size={24} className="text-[var(--brand)]" />
            </div>
            <h1 className="heading text-2xl mb-1">Upload your first document</h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">AI will extract key terms in under 60 seconds.</p>

            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-card p-10 text-center cursor-pointer transition-all mb-4',
                isDragActive ? 'border-[var(--brand)] bg-[var(--surface-deep)]' : 'border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--surface-deep)]'
              )}
            >
              <input {...getInputProps()} />
              <Upload size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="font-medium text-[var(--text-primary)]">Drop your contract or bill here</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">PDF only · Max 50 MB</p>
            </div>

            {stage === 'processing' && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-muted)]">AI extracting…</span>
                  <span className="font-bold text-[var(--brand)]">{progress}%</span>
                </div>
                <div className="h-1.5 bg-[var(--surface-deep)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--brand)] transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {stage === 'done' && (
              <p className="text-sm text-[var(--brand)] font-medium mb-4 flex items-center gap-1"><Check size={14} /> Extraction complete!</p>
            )}
            <p className="text-xs text-center text-[var(--text-muted)]">or <button onClick={() => setStep(2)} className="text-[var(--brand)] underline">skip for now</button></p>
          </>
        )}

        {/* Step 3 — Done */}
        {step === 2 && (
          <>
            <div className="w-12 h-12 rounded-card bg-[var(--brand-muted)] flex items-center justify-center mb-5">
              <BarChart3 size={24} className="text-[var(--brand)]" />
            </div>
            <h1 className="heading text-2xl mb-1">You're all set, {orgName || 'there'}!</h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">Your dashboard is ready. Here's a preview of what to expect.</p>
            {/* Mini dashboard preview */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Active Contracts', value: '5' },
                { label: 'Total Spend', value: '$356k' },
                { label: 'Expiring in 30d', value: '2' },
                { label: 'Obligations Due', value: '4' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[var(--surface-deep)] rounded-badge p-3">
                  <p className="label-muted mb-1">{label}</p>
                  <p className="font-bold text-lg text-[var(--text-primary)]">{value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {step > 0 ? (
            <Button variant="ghost" size="sm" disabled={loading} onClick={() => setStep(step - 1)}>Back</Button>
          ) : <div />}
          <Button
            variant="primary"
            disabled={!canContinue || loading}
            onClick={async () => {
              if (step === 0) {
                try {
                  setLoading(true);
                  setError(null);
                  const res = await axios.post('/organizations', { name: orgName, planType: plan });
                  if (res.data.token) {
                    localStorage.setItem('termly_token', res.data.token);
                  }
                  await refreshUser();
                  setStep(1);
                } catch (err: any) {
                  setError(err.response?.data?.error || 'Failed to create workspace. Please try again.');
                } finally {
                  setLoading(false);
                }
              } else if (step === 1) {
                setStep(2);
              } else {
                router.push('/dashboard');
              }
            }}
          >
            {loading ? 'Processing...' : step === 2 ? 'Go to Dashboard →' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

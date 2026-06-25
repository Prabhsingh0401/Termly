'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card } from '@/app/components/ui/Card';
import { Toggle } from '@/app/components/ui/Toggle';
import { ALERTS } from '@/app/lib/dummy-data';
import { formatDate, cn } from '@/app/lib/utils';
import { Bell, Mail, MessageSquare, Smartphone, CheckCircle2 } from 'lucide-react';

const ALERT_TYPE_LABELS: Record<string, string> = {
  renewal_90: '90-day renewal alert',
  renewal_30: '30-day renewal alert',
  renewal_7:  '7-day renewal alert',
  obligation_due: 'Obligation due',
};

const ALERT_TYPE_ICONS: Record<string, React.ReactNode> = {
  renewal_90: <Bell size={14} className="text-[var(--brand)]" />,
  renewal_30: <Bell size={14} className="text-[var(--risk-medium)]" />,
  renewal_7:  <Bell size={14} className="text-[var(--risk-high)]" />,
  obligation_due: <CheckCircle2 size={14} className="text-[var(--risk-medium)]" />,
};

const PREFS_INITIAL = {
  renewal_90:     { email: true,  inApp: true,  sms: false },
  renewal_30:     { email: true,  inApp: true,  sms: true  },
  renewal_7:      { email: true,  inApp: true,  sms: true  },
  obligation_due: { email: false, inApp: true,  sms: false },
};

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState(PREFS_INITIAL);
  const [activeTab, setActiveTab] = useState<'history' | 'preferences'>('history');

  const setPref = (type: string, channel: string, val: boolean) => {
    setPrefs((p: any) => ({ ...p, [type]: { ...p[type], [channel]: val } }));
  };

  return (
    <DashboardLayout>
      <div className="mb-5 flex gap-0 border-b border-[var(--border)]">
        {(['history', 'preferences'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand)] rounded-t" />}
          </button>
        ))}
      </div>

      {activeTab === 'history' && (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                {['', 'Alert', 'Contract', 'Channel', 'Sent At'].map((h) => (
                  <th key={h} className="label-muted text-left px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALERTS.map((alert, i) => (
                <tr key={alert.id} className={`border-b border-[var(--border)] transition-colors ${i % 2 === 1 ? 'bg-[var(--surface-deep)]' : ''}`}>
                  <td className="px-5 py-3 w-8">
                    <div className={cn('w-2 h-2 rounded-full', alert.read ? 'bg-[var(--border)]' : 'bg-[var(--brand)]')} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {ALERT_TYPE_ICONS[alert.alertType]}
                      <span className="font-medium text-[var(--text-primary)]">{ALERT_TYPE_LABELS[alert.alertType]}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">{alert.contractTitle}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-[var(--surface-deep)] px-2 py-1 rounded-badge text-[var(--text-muted)] capitalize">{alert.channel.replace('_', '-')}</span>
                  </td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">
                    {alert.sentAt ? formatDate(alert.sentAt) : <span className="text-[var(--risk-medium)]">Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <div className="max-w-2xl">
          <Card>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Alert Preferences</h3>
            <p className="text-sm text-[var(--text-muted)] mb-5">Choose how you receive each type of alert.</p>

            <div className="space-y-0 divide-y divide-[var(--border)]">
              <div className="grid grid-cols-4 py-2">
                <div />
                {['Email', 'In-App', 'SMS'].map((ch) => (
                  <p key={ch} className="label-muted text-center">{ch}</p>
                ))}
              </div>
              {Object.entries(prefs).map(([type, channels]: [string, any]) => (
                <div key={type} className="grid grid-cols-4 items-center py-4">
                  <div className="flex items-center gap-2">
                    {ALERT_TYPE_ICONS[type]}
                    <span className="text-sm font-medium text-[var(--text-primary)]">{ALERT_TYPE_LABELS[type]}</span>
                  </div>
                  <div className="flex justify-center"><Toggle checked={channels.email} onChange={(v) => setPref(type, 'email', v)} /></div>
                  <div className="flex justify-center"><Toggle checked={channels.inApp} onChange={(v) => setPref(type, 'inApp', v)} /></div>
                  <div className="flex justify-center"><Toggle checked={channels.sms} onChange={(v) => setPref(type, 'sms', v)} /></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

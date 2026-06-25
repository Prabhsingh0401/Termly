'use client';
import { SettingsGroup, SettingsItem } from '@/app/components/settings/SettingsGroup';
import { Button } from '@/app/components/ui/Button';
import { useTheme } from 'next-themes';
import { 
  User, Building2, CreditCard, Users, 
  Bell, Moon, Shield, ChevronRight 
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-muted)] mt-1">Manage your account, team, and preferences.</p>
      </div>

      {/* Profile Section */}
      <SettingsGroup title="Profile">
        <SettingsItem
          icon={<User size={18} />}
          label="Personal Information"
          description="Update your photo and personal details."
          value="Priya Singh"
          action={<Button variant="ghost" size="sm">Edit</Button>}
        />
        <SettingsItem
          icon={<Shield size={18} />}
          label="Password & Security"
          description="Manage your password and 2-step verification."
          action={<ChevronRight size={18} className="text-[var(--text-muted)]" />}
          onClick={() => {}}
        />
      </SettingsGroup>

      {/* Organization Section */}
      <SettingsGroup title="Organization">
        <SettingsItem
          icon={<Building2 size={18} />}
          label="Termly Workspace"
          description="Manage your organization's core details."
          value="termly-org-1234"
          action={<Button variant="ghost" size="sm">Manage</Button>}
        />
        <SettingsItem
          icon={<Users size={18} />}
          label="Team Members"
          description="Invite and manage access for your team."
          value="12 members"
          action={<ChevronRight size={18} className="text-[var(--text-muted)]" />}
          onClick={() => {}}
        />
        <SettingsItem
          icon={<CreditCard size={18} />}
          label="Billing & Plan"
          description="You are currently on the Pro plan ($99/mo)."
          value={<span className="px-2 py-1 bg-[var(--brand)] text-white text-xs font-bold rounded-md">PRO</span>}
          action={<ChevronRight size={18} className="text-[var(--text-muted)]" />}
          onClick={() => {}}
        />
      </SettingsGroup>

      {/* Preferences Section */}
      <SettingsGroup title="Preferences">
        <SettingsItem
          icon={<Moon size={18} />}
          label="Appearance"
          description="Customize how Termly looks on your device."
          action={
            mounted ? (
              <div className="flex bg-[var(--surface-deep)] p-1 rounded-lg">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${theme === 'light' ? 'bg-white shadow-sm text-black' : 'text-[var(--text-muted)]'}`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${theme === 'dark' ? 'bg-[#262626] shadow-sm text-white' : 'text-[var(--text-muted)]'}`}
                >
                  Dark
                </button>
              </div>
            ) : <div className="w-32 h-8 bg-[var(--surface-deep)] rounded-lg animate-pulse" />
          }
        />
        <SettingsItem
          icon={<Bell size={18} />}
          label="Notifications"
          description="Choose which alerts you want to receive."
          action={<ChevronRight size={18} className="text-[var(--text-muted)]" />}
          onClick={() => {}}
        />
      </SettingsGroup>
    </div>
  );
}

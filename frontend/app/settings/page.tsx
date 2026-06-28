'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { useAuth } from '@/app/components/providers/AuthProvider';
import { useTheme } from 'next-themes';
import axios from 'axios';
import {
  User, Building2, CreditCard, Users, Bell,
  Moon, Shield, Trash2, Plus, Check, X,
  ChevronRight, Edit2, Loader2,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function getToken() { return localStorage.getItem('termly_token') ?? ''; }
function authHeaders() { return { Authorization: `Bearer ${getToken()}` }; }

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.trim().split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const ROLE_STYLES: Record<string, React.CSSProperties> = {
  admin:   { background: 'rgba(4,124,88,0.12)',  color: '#047C58' },
  manager: { background: 'rgba(212,130,26,0.12)', color: '#D4821A' },
  viewer:  { background: 'rgba(140,136,107,0.12)', color: '#8C886B' },
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Free', pro: 'Pro', enterprise: 'Enterprise',
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="label-muted mb-3" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {title}
      </p>
      <div
        className="glass-card"
        style={{
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────
function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        borderBottom: last ? 'none' : '1px solid var(--border)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minHeight: 64,
      }}
    >
      {children}
    </div>
  );
}

// ─── Icon wrapper ──────────────────────────────────────────────────────────
function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(4,124,88,0.08)', color: 'var(--brand)',
      }}
    >
      {children}
    </span>
  );
}

// ─── Inline text input ────────────────────────────────────────────────────────
function InlineInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        flex: 1, padding: '6px 10px', borderRadius: 8,
        border: '1.5px solid var(--brand)', outline: 'none',
        background: 'var(--surface-deep)', color: 'var(--text-primary)',
        fontSize: 14,
      }}
    />
  );
}

// ─── Btn ─────────────────────────────────────────────────────────────────────
function Btn({
  onClick, variant = 'ghost', children, disabled, style,
}: {
  onClick?: () => void; variant?: 'brand' | 'ghost' | 'danger';
  children: React.ReactNode; disabled?: boolean; style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: 'none', transition: 'all 150ms ease',
  };
  const variants: Record<string, React.CSSProperties> = {
    brand:  { background: '#047C58', color: '#fff' },
    ghost:  { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' },
    danger: { background: 'transparent', color: 'var(--risk-high)', border: '1px solid var(--risk-high)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ─── Avatar circle ────────────────────────────────────────────────────────────
function Avatar({ name, size = 40 }: { name?: string | null; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #047C58 0%, #0a9f72 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: size * 0.35,
      }}
    >
      {getInitials(name)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();

  // Remote data
  const [org,  setOrg]  = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);

  // Edit states
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingOrg,     setEditingOrg]     = useState(false);
  const [profileName,    setProfileName]    = useState('');
  const [orgName,        setOrgName]        = useState('');

  // Invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole,  setInviteRole]  = useState('manager');
  const [inviting,    setInviting]    = useState(false);

  // Status
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [successMsg,  setSuccessMsg]  = useState<string | null>(null);
  const [mounted,     setMounted]     = useState(false);

  // ── Mount + fetch ───────────────────────────────────────────────────────────
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const headers = authHeaders();
    Promise.all([
      axios.get(`${API_BASE}/settings/organization`, { headers }),
      axios.get(`${API_BASE}/settings/team`,         { headers }),
    ])
      .then(([orgRes, teamRes]) => {
        setOrg(orgRes.data.organization);
        setOrgName(orgRes.data.organization?.name ?? '');
        setTeam(teamRes.data.data ?? []);
      })
      .catch((err) => console.error('Settings fetch error:', err));
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (!successMsg && !error) return;
    const t = setTimeout(() => { setSuccessMsg(null); setError(null); }, 4000);
    return () => clearTimeout(t);
  }, [successMsg, error]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function saveProfile() {
    setSaving(true); setError(null);
    try {
      await axios.patch(`${API_BASE}/settings/profile`, { fullName: profileName }, { headers: authHeaders() });
      await refreshUser();
      setEditingProfile(false);
      setSuccessMsg('Profile updated.');
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to save profile');
    } finally { setSaving(false); }
  }

  async function saveOrg() {
    setSaving(true); setError(null);
    try {
      const res = await axios.patch(`${API_BASE}/settings/organization`, { name: orgName }, { headers: authHeaders() });
      setOrg(res.data.organization);
      setEditingOrg(false);
      setSuccessMsg('Organization updated.');
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to save organization');
    } finally { setSaving(false); }
  }

  async function inviteMember() {
    if (!inviteEmail.includes('@')) { setError('Enter a valid email address'); return; }
    setInviting(true); setError(null);
    try {
      const res = await axios.post(`${API_BASE}/settings/invite`, { email: inviteEmail, role: inviteRole }, { headers: authHeaders() });
      setTeam((prev) => [...prev, res.data.user]);
      setInviteEmail('');
      setSuccessMsg(`${res.data.user.email} added to the team.`);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to invite member');
    } finally { setInviting(false); }
  }

  async function removeMember(memberId: string) {
    if (!window.confirm('Remove this member from the organization?')) return;
    try {
      await axios.delete(`${API_BASE}/settings/team/${memberId}`, { headers: authHeaders() });
      setTeam((prev) => prev.filter((m) => m.id !== memberId));
      setSuccessMsg('Member removed.');
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to remove member');
    }
  }

  const displayName = user?.fullName ?? user?.full_name ?? user?.name ?? 'Unknown';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-6 animate-in fade-in duration-500">

        {/* Page heading */}
        <div className="mb-8">
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Settings
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>
            Manage your account, team, and preferences.
          </p>
        </div>

        {/* Toast messages */}
        {(successMsg || error) && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 500,
              background: error ? 'rgba(192,57,43,0.1)' : 'rgba(4,124,88,0.1)',
              border: `1px solid ${error ? 'rgba(192,57,43,0.3)' : 'rgba(4,124,88,0.3)'}`,
              color: error ? 'var(--risk-high)' : 'var(--brand)',
            }}
          >
            {error ? <X size={14} /> : <Check size={14} />}
            {error ?? successMsg}
          </div>
        )}

        {/* ── Section 1: Profile ─────────────────────────────────────────────── */}
        <Section title="Profile">
          <Row last>
            <Avatar name={displayName} />
            <div style={{ flex: 1 }}>
              {editingProfile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <InlineInput
                    value={profileName}
                    onChange={setProfileName}
                    placeholder="Full name"
                  />
                  <Btn variant="brand" onClick={saveProfile} disabled={saving || !profileName.trim()}>
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    Save
                  </Btn>
                  <Btn onClick={() => setEditingProfile(false)}><X size={13} /></Btn>
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{displayName}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>{user?.email}</p>
                </>
              )}
            </div>
            {!editingProfile && (
              <Btn
                onClick={() => { setProfileName(displayName); setEditingProfile(true); }}
                style={{ gap: 5 }}
              >
                <Edit2 size={13} /> Edit
              </Btn>
            )}
          </Row>
        </Section>

        {/* ── Section 2: Password & Security ────────────────────────────────── */}
        <Section title="Security">
          <Row last>
            <IconWrap><Shield size={16} /></IconWrap>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Password &amp; Security</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>Manage your password and 2FA.</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </Row>
        </Section>

        {/* ── Section 3: Organization ───────────────────────────────────────── */}
        <Section title="Organization">
          <Row last>
            <IconWrap><Building2 size={16} /></IconWrap>
            <div style={{ flex: 1 }}>
              {editingOrg ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <InlineInput value={orgName} onChange={setOrgName} placeholder="Organization name" />
                  <Btn variant="brand" onClick={saveOrg} disabled={saving || !orgName.trim()}>
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    Save
                  </Btn>
                  <Btn onClick={() => setEditingOrg(false)}><X size={13} /></Btn>
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                    {org?.name ?? '—'}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>
                    Organization name
                  </p>
                </>
              )}
            </div>
            {!editingOrg && (
              <Btn onClick={() => { setOrgName(org?.name ?? ''); setEditingOrg(true); }} style={{ gap: 5 }}>
                <Edit2 size={13} /> Edit
              </Btn>
            )}
          </Row>
        </Section>

        {/* ── Section 4: Team Members ───────────────────────────────────────── */}
        <Section title="Team Members">
          {team.map((member, i) => (
            <Row key={member.id} last={i === team.length - 1 && true}>
              <Avatar name={member.full_name ?? member.email} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {member.full_name ?? member.email}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {member.email}
                </p>
              </div>
              <span
                style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px',
                  borderRadius: 999, flexShrink: 0, textTransform: 'capitalize',
                  ...(ROLE_STYLES[member.role] ?? ROLE_STYLES.viewer),
                }}
              >
                {member.role}
              </span>
              {member.id !== user?.id && (
                <button
                  onClick={() => removeMember(member.id)}
                  title="Remove member"
                  style={{
                    display: 'flex', alignItems: 'center', padding: 6, borderRadius: 6,
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    color: 'var(--text-muted)', transition: 'color 150ms, background 150ms',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--risk-high)'; (e.currentTarget as HTMLElement).style.background = 'rgba(192,57,43,0.08)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </Row>
          ))}

          {/* Invite row */}
          <div
            style={{
              borderTop: '1px solid var(--border)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              style={{
                flex: '1 1 200px', padding: '7px 10px', borderRadius: 8,
                border: '1.5px solid var(--border)', outline: 'none',
                background: 'var(--surface-deep)', color: 'var(--text-primary)', fontSize: 13,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#047C58')}
              onBlur={(e)  => (e.currentTarget.style.borderColor = 'var(--border)')}
              onKeyDown={(e) => { if (e.key === 'Enter') inviteMember(); }}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              style={{
                padding: '7px 10px', borderRadius: 8, fontSize: 13,
                border: '1.5px solid var(--border)',
                background: 'var(--surface-deep)', color: 'var(--text-primary)', outline: 'none',
              }}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
            <Btn
              variant="brand"
              onClick={inviteMember}
              disabled={inviting || !inviteEmail.trim()}
              style={{ gap: 6 }}
            >
              {inviting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Invite
            </Btn>
          </div>
        </Section>

        {/* ── Section 5: Plan & Billing ─────────────────────────────────────── */}
        <Section title="Plan &amp; Billing">
          <Row last>
            <IconWrap><CreditCard size={16} /></IconWrap>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                {org ? (
                  <>
                    You are on the{' '}
                    <span
                      style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                        background: '#047C58', color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                        marginLeft: 4, verticalAlign: 'middle',
                      }}
                    >
                      {PLAN_LABELS[org.plan_type] ?? org.plan_type}
                    </span>{' '}
                    plan
                  </>
                ) : '—'}
              </p>
              {org && (
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>
                  {parseInt(org.seats_used, 10)} of {org.seats_limit} seats used
                </p>
              )}
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </Row>
        </Section>

        {/* ── Section 6: Appearance ─────────────────────────────────────────── */}
        <Section title="Preferences">
          <Row>
            <IconWrap><Moon size={16} /></IconWrap>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Appearance</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>Customize how Termly looks on your device.</p>
            </div>
            {mounted ? (
              <div
                style={{
                  display: 'flex', background: 'var(--surface-deep)', padding: 4, borderRadius: 10,
                }}
              >
                {(['light', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    style={{
                      padding: '5px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                      border: 'none', cursor: 'pointer', transition: 'all 150ms ease', textTransform: 'capitalize',
                      background: theme === t ? (t === 'light' ? '#fff' : '#1a1a1a') : 'transparent',
                      color: theme === t ? (t === 'light' ? '#000' : '#fff') : 'var(--text-muted)',
                      boxShadow: theme === t ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ width: 120, height: 32, borderRadius: 10, background: 'var(--surface-deep)' }} className="animate-pulse" />
            )}
          </Row>
          <Row last>
            <IconWrap><Bell size={16} /></IconWrap>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Notifications</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>Choose which alerts you want to receive.</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </Row>
        </Section>

      </div>
    </DashboardLayout>
  );
}

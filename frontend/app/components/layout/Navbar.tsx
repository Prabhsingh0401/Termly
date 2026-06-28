'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ALERTS } from '@/app/lib/dummy-data';
import { getInitials } from '@/app/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/app/components/providers/AuthProvider';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/contracts':     'Contracts',
  '/vendors':       'Vendors',
  '/upload':        'Upload Document',
  '/search':        'Search',
  '/approvals':     'Approvals',
  '/notifications': 'Notifications',
  '/audit-log':     'Audit Log',
};

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [bellOpen, setBellOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setBellOpen(false);
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const pageTitle = PAGE_TITLES[pathname] ?? 'Termly';
  const unread = ALERTS.filter((a) => !a.read).length;

  return (
    <header
      className="h-16 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-40 transition-all duration-300"
      style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      }}
    >
      {/* Left — Page title */}
      <h1 className="heading text-[16px]">{pageTitle}</h1>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <Link
          href="/search"
          className="w-9 h-9 flex items-center justify-center rounded-btn text-[var(--text-muted)] hover:bg-[var(--brand-muted)] hover:text-[var(--brand)] transition-all duration-200 active:scale-90"
          aria-label="Search"
        >
          <Search size={18} />
        </Link>

        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 flex items-center justify-center rounded-btn text-[var(--text-muted)] hover:bg-[var(--brand-muted)] hover:text-[var(--brand)] transition-all duration-200 active:scale-90"
          aria-label="Toggle theme"
        >
          {!mounted ? (
            <Moon size={18} />
          ) : theme === 'dark' ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>

        {/* Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => { setBellOpen(!bellOpen); setAvatarOpen(false); }}
            className="w-9 h-9 flex items-center justify-center rounded-btn text-[var(--text-muted)] hover:bg-[var(--brand-muted)] hover:text-[var(--brand)] transition-all duration-200 active:scale-90"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--brand)] text-[var(--surface)] text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unread}
              </span>
            )}
          </button>

          {/* Bell dropdown */}
          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 glass-card !bg-white dark:!bg-[#0A0A0A] !backdrop-blur-2xl p-0 overflow-hidden animate-[slideInUp_200ms_ease] z-50">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Notifications</p>
              </div>
              <ul className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
                {ALERTS.filter((a) => !a.read).map((alert) => (
                  <li key={alert.id} className="px-4 py-3 hover:bg-[var(--brand-muted)] transition-colors">
                    <p className="text-xs font-medium text-[var(--text-primary)] leading-snug">
                      {alert.contractTitle}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {alert.alertType.replace('_', ' ').toUpperCase()} alert
                    </p>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2 border-t border-[var(--border)]">
                <Link href="/notifications" className="text-xs text-[var(--brand)] font-semibold hover:underline" onClick={() => setBellOpen(false)}>
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="w-8 h-8 rounded-full bg-[var(--brand)] flex items-center justify-center ml-1 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 shadow-sm" 
            title={user?.fullName || 'User'}
            onClick={() => { setAvatarOpen(!avatarOpen); setBellOpen(false); }}
          >
            <span className="text-[var(--surface)] text-xs font-bold">{getInitials(user?.fullName || 'User')}</span>
          </div>

          {/* Avatar dropdown */}
          {avatarOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 glass-card !bg-white dark:!bg-[#0A0A0A] !backdrop-blur-2xl p-1 overflow-hidden animate-[slideInUp_200ms_ease] z-50">
              <div className="px-3 py-2 mb-1 border-b border-[var(--border)]">
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{user?.fullName || 'User'}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{user?.email || ''}</p>
              </div>
              <div className="flex flex-col">
                <Link 
                  href="/settings" 
                  className="px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--brand-muted)] hover:text-[var(--brand)] rounded-md transition-colors"
                  onClick={() => setAvatarOpen(false)}
                >
                  Settings
                </Link>
                <button 
                  onClick={() => { setAvatarOpen(false); logout(); }}
                  className="px-3 py-2 text-left text-sm font-medium text-risk-high hover:bg-risk-high hover:!text-white rounded-md transition-colors w-full"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

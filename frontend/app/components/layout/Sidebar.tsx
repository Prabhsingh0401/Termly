'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import {
  LayoutDashboard, FileText, Building2, Upload, Search,
  CheckSquare, Bell, ScrollText, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Contracts', href: '/contracts', icon: FileText },
  { label: 'Vendors', href: '/vendors', icon: Building2 },
  { label: 'Upload', href: '/upload', icon: Upload },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Approvals', href: '/approvals', icon: CheckSquare },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Audit Log', href: '/audit-log', icon: ScrollText },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  mobileMode?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobileMode = false, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex-col transition-all duration-300 ease-in-out flex-shrink-0',
        mobileMode ? 'flex h-full w-full bg-transparent' : 'hidden md:flex h-full',
        !mobileMode && collapsed ? 'w-20' : (mobileMode ? 'w-full' : 'w-64'),
      )}
      style={{
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {/* Logo */}
      {!mobileMode && (
        <div className={cn('flex items-center h-16 flex-shrink-0', collapsed ? 'justify-center px-0' : 'justify-start px-6')}>
          <div className="flex items-center flex-shrink-0 overflow-hidden">
            <img 
              src="/main_logo.png" 
              alt="Termly" 
              className={cn(
                "object-contain mix-blend-darken dark:invert dark:mix-blend-screen transition-all duration-300 origin-left",
                collapsed ? "w-10" : "w-[140px]"
              )} 
            />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={mobileMode ? onNavigate : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-all duration-150 active:scale-[0.98]',
                    'hover:bg-[var(--brand-muted)] hover:text-[var(--brand)]',
                    isActive ? 'sidebar-active' : 'text-[var(--text-muted)]',
                    !mobileMode && collapsed && 'justify-center px-0 rounded-lg',
                  )}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {(!collapsed || mobileMode) && <span>{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      {!mobileMode && (
        <div className="p-4 flex-shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2 rounded-btn text-[var(--text-muted)]',
              'hover:bg-[var(--brand-muted)] hover:text-[var(--brand)] transition-all text-xs font-medium',
            )}
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
          </button>
        </div>
      )}
    </aside>
  );
}

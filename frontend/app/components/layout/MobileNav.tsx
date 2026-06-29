'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Search, Menu, X, Receipt } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useState } from 'react';
import { Sidebar } from './Sidebar';

const MOBILE_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Contracts', href: '/contracts', icon: FileText },
  { label: 'Bills', href: '/bills', icon: Receipt },
  { label: 'Search', href: '/search', icon: Search },
];

export function MobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div 
          className="glass-card flex items-center justify-around px-2 py-3 shadow-lg"
          style={{ borderRadius: '24px' }}
        >
          {MOBILE_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-all duration-200 active:scale-95',
                  isActive ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                <div className={cn('p-1 rounded-full transition-all', isActive && 'bg-[var(--brand-muted)]')}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-all duration-200 active:scale-95',
              menuOpen ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            <div className={cn('p-1 rounded-full transition-all', menuOpen && 'bg-[var(--brand-muted)]')}>
              {menuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2} />}
            </div>
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* Full-screen mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[var(--bg)] animate-in fade-in zoom-in-95 duration-200 flex flex-col pb-24 pt-4 px-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-[18px] tracking-tight text-[var(--text-primary)]">
                Termly
              </span>
            </div>
          </div>
          <div className="flex-1 w-full relative">
             <div className="absolute inset-0">
               <Sidebar mobileMode onNavigate={() => setMenuOpen(false)} />
             </div>
          </div>
        </div>
      )}
    </>
  );
}

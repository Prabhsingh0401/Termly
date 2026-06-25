'use client';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--bg)]">
      <Sidebar />
      {/* Inset window effect on desktop, full bleed on mobile */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden md:p-3 md:pl-0 transition-all duration-300">
        <div className="flex flex-col flex-1 bg-[var(--surface)] md:rounded-[24px] md:shadow-sm overflow-hidden relative border border-[var(--glass-border)]">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            {children}
          </main>
          <MobileNav />
        </div>
      </div>
    </div>
  );
}

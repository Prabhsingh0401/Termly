'use client'

import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center pt-4 px-4">
      {/* Desktop pill */}
      <div
        className={`hidden md:flex w-full max-w-4xl items-center justify-between rounded-full border border-border/60 px-6 py-2.5 shadow-lg transition-all duration-300 ${
          scrolled ? 'glass shadow-black/20' : 'bg-card/70 backdrop-blur-md'
        }`}
      >
        <a href="#" className="flex items-center pl-1">
          <span className="text-base font-semibold tracking-tight">Termly</span>
        </a>

        <nav className="flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/login"
            className={cn(buttonVariants({ size: 'sm' }), "rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90")}
          >
            Start Free
          </a>
        </div>
      </div>

      {/* Mobile pill */}
      <div
        className={`flex w-full items-center justify-between rounded-full border border-border/60 px-4 py-2.5 shadow-lg transition-all duration-300 md:hidden ${
          scrolled ? 'glass shadow-black/20' : 'bg-card/70 backdrop-blur-md'
        }`}
      >
        <a href="#" className="flex items-center">
          <span className="text-base font-semibold tracking-tight">Termly</span>
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute top-[4.5rem] left-4 right-4 rounded-2xl border border-border/60 glass shadow-lg md:hidden">
          <nav className="flex flex-col gap-1 p-3">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-1 border-t border-border/50 px-3 pt-3">
              <a
                href="/login"
                className={cn(buttonVariants({ size: 'sm' }), "w-full rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90 flex justify-center")}
              >
                Start Free
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

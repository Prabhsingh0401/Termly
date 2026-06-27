'use client'

import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  FileWarning,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Users,
  X,
} from 'lucide-react'
import { Reveal } from './reveal'

const current = [
  { label: 'Messy spreadsheets', icon: TableProperties },
  { label: 'Endless email chains', icon: Mail },
  { label: 'Scattered PDFs', icon: FileWarning },
  { label: 'Missed renewals', icon: AlertTriangle },
  { label: 'Manual tracking', icon: X },
]

const termly = [
  { label: 'Centralized dashboard', icon: LayoutDashboard },
  { label: 'Automated extraction', icon: Sparkles },
  { label: 'Smart reminders', icon: BellRing },
  { label: 'Risk monitoring', icon: ShieldCheck },
  { label: 'Vendor intelligence', icon: Users },
]

export function Problem() {
  return (
    <section id="solutions" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            The shift
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From scattered chaos to a single source of truth
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Most teams manage contracts across tools that were never built for
            it. Termly brings everything into one intelligent workspace.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal delay={1}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Current Reality</h3>
                <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  Costly
                </span>
              </div>
              <ul className="space-y-3">
                {current.map((item) => {
                  const Icon = item.icon
                  return (
                    <li
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3"
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {item.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-primary/30 bg-card p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" />
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Termly Workspace</h3>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  Automated
                </span>
              </div>
              <ul className="space-y-3">
                {termly.map((item) => {
                  const Icon = item.icon
                  return (
                    <li
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3"
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                      <CheckCircle2 className="ml-auto size-4 text-accent" />
                    </li>
                  )
                })}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

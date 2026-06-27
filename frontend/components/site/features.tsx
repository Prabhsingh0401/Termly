'use client'

import {
  BellRing,
  Database,
  FileSearch,
  LineChart,
  Repeat,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Reveal } from './reveal'

const features = [
  {
    icon: FileSearch,
    title: 'Contract Extraction',
    desc: 'Pull key terms, dates, and clauses from any document automatically.',
  },
  {
    icon: Repeat,
    title: 'Recurring Billing Tracking',
    desc: 'Monitor every subscription and recurring bill in one calendar.',
  },
  {
    icon: BellRing,
    title: 'Renewal Alerts',
    desc: 'Proactive reminders so a deadline never slips through the cracks.',
  },
  {
    icon: Users,
    title: 'Vendor Intelligence',
    desc: 'Understand spend, terms, and history across every vendor.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance Monitoring',
    desc: 'Stay ahead of obligations, SLAs, and regulatory requirements.',
  },
  {
    icon: LineChart,
    title: 'Spend Analytics',
    desc: 'Visualize committed spend and forecast future billing.',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Detection',
    desc: 'Surface auto-renewals, price hikes, and risky clauses early.',
  },
  {
    icon: Database,
    title: 'Centralized Repository',
    desc: 'A single, searchable source of truth for all your agreements.',
  },
]

export function Features() {
  return (
    <section id="resources" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Capabilities
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to manage contracts intelligently
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <Reveal key={f.title} delay={i % 4}>
                <div className="group h-full rounded-2xl border border-border/50 bg-card/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

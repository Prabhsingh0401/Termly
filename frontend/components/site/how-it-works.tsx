'use client'

import { motion } from 'motion/react'
import {
  BellRing,
  LayoutDashboard,
  ScanText,
  ShieldAlert,
  Upload,
} from 'lucide-react'
import { Reveal } from './reveal'

const steps = [
  {
    icon: Upload,
    title: 'Upload',
    desc: 'Drop in contracts, invoices, and recurring bills in any format.',
    points: ['PDFs & scans', 'Email forwarding', 'Bulk import'],
  },
  {
    icon: ScanText,
    title: 'Auto Extracts',
    desc: 'Termly reads every document and pulls the details that matter.',
    points: [
      'Renewal dates',
      'Billing cycles',
      'Payment terms',
      'Vendor details',
      'SLA obligations',
    ],
  },
  {
    icon: ShieldAlert,
    title: 'Risk Analysis',
    desc: 'Auto-renewals, price hikes, and compliance gaps are flagged.',
    points: ['Risk scoring', 'Clause detection', 'Anomaly alerts'],
  },
  {
    icon: BellRing,
    title: 'Alerts & Reminders',
    desc: 'Proactive notifications reach the right people before deadlines.',
    points: ['Smart timing', 'Slack & email', 'Escalation rules'],
  },
  {
    icon: LayoutDashboard,
    title: 'Finance Dashboard',
    desc: 'A live view of spend, renewals, and obligations across vendors.',
    points: ['Spend analytics', 'Renewal timeline', 'Exportable reports'],
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From upload to insight in five steps
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            An automated pipeline that turns raw documents into financial
            intelligence.
          </p>
        </Reveal>

        <div className="relative mt-16">
          {/* connector line */}
          <div className="absolute left-0 right-0 top-7 hidden lg:block">
            <div className="mx-auto h-px max-w-6xl bg-border" />
            <motion.div
              className="mx-auto h-px max-w-6xl origin-left bg-gradient-to-r from-primary to-accent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              style={{ marginTop: '-1px' }}
            />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <Reveal key={step.title} delay={i} className="relative">
                  <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                    <span className="relative z-10 flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm">
                      <Icon className="size-6" />
                      <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {i + 1}
                      </span>
                    </span>
                    <h3 className="mt-5 text-base font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {step.points.map((p) => (
                        <li
                          key={p}
                          className="flex items-center gap-2 text-xs text-muted-foreground lg:justify-start"
                        >
                          <span className="size-1 rounded-full bg-accent" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

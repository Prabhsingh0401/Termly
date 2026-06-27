'use client'

import { motion } from 'motion/react'
import {
  BarChart3,
  Bell,
  Building2,
  FileText,
  LayoutDashboard,
  Receipt,
  Settings,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { Reveal } from './reveal'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Contracts', icon: FileText },
  { label: 'Vendors', icon: Building2 },
  { label: 'Invoices', icon: Receipt },
  { label: 'Billing', icon: Wallet },
  { label: 'Alerts', icon: Bell },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
]

const vendorSpend = [
  { name: 'AWS', value: 92 },
  { name: 'Salesforce', value: 74 },
  { name: 'Figma', value: 48 },
  { name: 'Slack', value: 36 },
  { name: 'Notion', value: 22 },
]

const forecast = [40, 55, 48, 62, 70, 58, 75, 82, 68, 88, 79, 94]

const renewals = [
  { vendor: 'Salesforce', date: 'Mar 14', value: '$48,000', status: 'Due soon' },
  { vendor: 'AWS EDP', date: 'Apr 02', value: '$120,000', status: 'On track' },
  { vendor: 'Datadog', date: 'Apr 19', value: '$31,500', status: 'At risk' },
]

export function ProductShowcase() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            The product
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            One dashboard for every contract and bill
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Purpose-built for finance, procurement, and operations teams who
            need clarity at a glance.
          </p>
        </Reveal>

        <Reveal delay={1} className="mt-14">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5">
            <div className="grid lg:grid-cols-[220px_1fr]">
              {/* sidebar */}
              <aside className="hidden border-r border-border bg-muted/30 p-4 lg:block">
                <div className="flex items-center gap-2 px-2 pb-5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <ShieldCheck className="size-4" />
                  </span>
                  <span className="text-sm font-semibold">Termly</span>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <span
                        key={item.label}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                          item.active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </span>
                    )
                  })}
                </nav>
              </aside>

              {/* main */}
              <div className="bg-background/85 p-5 lg:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Contract Overview</h3>
                    <p className="text-sm text-muted-foreground">
                      Last updated just now
                    </p>
                  </div>
                  <span className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Last 30 days
                  </span>
                </div>

                {/* stat cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { label: 'Active Contracts', value: '327', sub: '+12' },
                    { label: 'Managed Spend', value: '$1.2M', sub: '+4.1%' },
                    { label: 'Upcoming Renewals', value: '23', sub: '30d' },
                    { label: 'Risk Flags', value: '6', sub: 'review' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="mt-1.5 text-xl font-semibold tracking-tight">
                        {s.value}
                      </p>
                      <p className="mt-1 text-xs font-medium text-accent">
                        {s.sub}
                      </p>
                    </div>
                  ))}
                </div>

                {/* charts row */}
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {/* vendor spend */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium">Spend by Vendor</p>
                      <span className="text-xs text-muted-foreground">
                        annualized
                      </span>
                    </div>
                    <div className="space-y-3">
                      {vendorSpend.map((v, i) => (
                        <div key={v.name} className="flex items-center gap-3">
                          <span className="w-20 text-xs text-muted-foreground">
                            {v.name}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              className="h-full rounded-full bg-primary"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${v.value}%` }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.9,
                                delay: i * 0.1,
                                ease: 'easeOut',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* monthly forecast */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Monthly Billing Forecast
                      </p>
                      <span className="text-xs font-medium text-accent">
                        +18%
                      </span>
                    </div>
                    <div className="flex h-28 items-end gap-1.5">
                      {forecast.map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary"
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.7,
                            delay: i * 0.05,
                            ease: 'easeOut',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* renewals table */}
                <div className="mt-4 rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Upcoming Renewals</p>
                    <span className="text-xs text-primary">View all</span>
                  </div>
                  <div className="space-y-1">
                    {renewals.map((r) => (
                      <div
                        key={r.vendor}
                        className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm hover:bg-muted/50"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Building2 className="size-3.5" />
                          </span>
                          {r.vendor}
                        </span>
                        <span className="hidden text-muted-foreground sm:block">
                          {r.date}
                        </span>
                        <span className="font-medium">{r.value}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            r.status === 'At risk'
                              ? 'bg-destructive/10 text-destructive'
                              : r.status === 'Due soon'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-accent/10 text-accent'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

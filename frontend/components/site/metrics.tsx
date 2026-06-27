'use client'

import { animate, motion, useInView } from 'motion/react'
import { Database, ShieldCheck, TrendingDown, CalendarCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function Counter({
  to,
  suffix = '',
  prefix = '',
}: {
  to: number
  suffix?: string
  prefix?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setVal(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to])

  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  )
}

const metrics = [
  {
    icon: TrendingDown,
    title: 'Reduce Manual Work',
    counter: { to: 80, suffix: '%' },
    desc: 'Less time spent chasing dates and tracking spreadsheets.',
  },
  {
    icon: ShieldCheck,
    title: 'Prevent Revenue Leakage',
    counter: { prefix: '$', to: 1, suffix: '.2M+' },
    desc: 'Recover spend lost to unwanted auto-renewals and overages.',
  },
  {
    icon: CalendarCheck,
    title: 'Track Every Renewal',
    counter: { to: 100, suffix: '%' },
    desc: 'Full visibility into every upcoming contract deadline.',
  },
  {
    icon: Database,
    title: 'Single Source of Truth',
    counter: { to: 1, suffix: '' },
    desc: 'One unified workspace for contracts, vendors, and bills.',
  },
]

export function Metrics() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            The impact
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Results teams feel from day one
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => {
            const Icon = m.icon
            return (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 text-center"
              >
                <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-primary">
                  <Counter {...m.counter} />
                </p>
                <h3 className="mt-2 text-sm font-semibold">{m.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {m.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

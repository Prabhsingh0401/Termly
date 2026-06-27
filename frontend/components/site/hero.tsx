'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  FileText,
  Sparkles,
  ShieldAlert,
  Upload,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const stages = [
  { label: 'Contract Uploaded', icon: Upload },
  { label: 'Processing', icon: Sparkles },
  { label: 'Key Dates Extracted', icon: CalendarClock },
  { label: 'Risk Detection', icon: ShieldAlert },
  { label: 'Renewal Alerts Scheduled', icon: BellRing },
]

const floatingMetrics = [
  { value: '327', label: 'Active Contracts' },
  { value: '$1.2M', label: 'Managed Spend' },
  { value: '23', label: 'Upcoming Renewals' },
  { value: '97%', label: 'Extraction Accuracy' },
]

export function Hero() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((p) => (p + 1) % stages.length)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[480px] w-[840px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-0 top-40 h-[320px] w-[320px] rounded-full bg-accent/10 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage:
              'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Left copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <span className="flex size-1.5 rounded-full bg-accent" />
            Contract & Billing Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Never Miss a Contract Renewal Again.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            Intelligent contract management and recurring billing automation
            for modern businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="/login"
              className={cn(buttonVariants({ size: 'lg' }), "gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center")}
            >
              <Upload className="size-4" />
              Upload Contract
            </a>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-lg border-border bg-card/50 hover:bg-accent/10"
            >
              Book Demo
              <ArrowUpRight className="size-4" />
            </Button>
          </motion.div>


        </div>

        {/* Right animated dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5">
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="size-3 rounded-full bg-destructive/40" />
              <span className="size-3 rounded-full bg-accent/40" />
              <span className="size-3 rounded-full bg-primary/40" />
              <span className="ml-3 text-xs text-muted-foreground">
                app.termly.io / processing
              </span>
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      Acme_MSA_2026.pdf
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Vendor agreement · 14 pages
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                  Live
                </span>
              </div>

              {/* pipeline */}
              <div className="space-y-2.5">
                {stages.map((stage, i) => {
                  const isActive = i === active
                  const isDone =
                    i < active || (active === 0 && i === stages.length - 1)
                  const Icon = stage.icon
                  return (
                    <div
                      key={stage.label}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-400 ${
                        isActive
                          ? 'border-primary bg-primary/8'
                          : 'border-border bg-transparent'
                      }`}
                    >
                      <span
                        className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : isDone
                              ? 'bg-accent/15 text-accent'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isDone && !isActive ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Icon className="size-4" />
                        )}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {stage.label}
                      </span>
                      {isActive && (
                        <span className="ml-auto flex gap-1">
                          {[0, 1, 2].map((d) => (
                            <motion.span
                              key={d}
                              className="size-1.5 rounded-full bg-primary"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: d * 0.15,
                              }}
                            />
                          ))}
                        </span>
                      )}
                      {isDone && !isActive && (
                        <span className="ml-auto text-xs font-medium text-accent">
                          Done
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* progress bar */}
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  animate={{
                    width: `${((active + 1) / stages.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* floating metrics */}
          <FloatingCard
            className="-left-6 top-8 hidden sm:block"
            metric={floatingMetrics[0]}
            delay={0.6}
          />
          <FloatingCard
            className="-right-4 top-24 hidden lg:block"
            metric={floatingMetrics[3]}
            delay={0.8}
          />
          <FloatingCard
            className="-bottom-6 -left-4 hidden sm:block"
            metric={floatingMetrics[2]}
            delay={1}
          />
          <FloatingCard
            className="-bottom-8 right-6 hidden lg:block"
            metric={floatingMetrics[1]}
            delay={1.2}
          />
        </motion.div>
      </div>
    </section>
  )
}

function FloatingCard({
  metric,
  className,
  delay,
}: {
  metric: { value: string; label: string }
  className?: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`absolute z-10 ${className}`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: delay * 0.5 }}
        className="rounded-xl border border-border glass px-4 py-3 shadow-lg"
      >
        <p className="text-lg font-semibold tracking-tight">{metric.value}</p>
        <p className="text-xs text-muted-foreground">{metric.label}</p>
      </motion.div>
    </motion.div>
  )
}

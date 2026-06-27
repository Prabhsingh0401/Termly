'use client'

import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, FileText, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Reveal } from './reveal'

const fields = [
  { label: 'Vendor Name', value: 'Acme Cloud Inc.', confidence: 99 },
  { label: 'Contract Value', value: '$120,000 / yr', confidence: 98 },
  { label: 'Start Date', value: 'Jan 01, 2026', confidence: 97 },
  { label: 'Renewal Date', value: 'Dec 31, 2026', confidence: 96 },
  { label: 'Termination Clause', value: '60-day notice', confidence: 93 },
  { label: 'Payment Terms', value: 'Net 30', confidence: 98 },
  { label: 'Auto-Renewal Flag', value: 'Enabled', confidence: 95 },
]

export function AiExtraction() {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (visibleCount >= fields.length) {
      const reset = setTimeout(() => setVisibleCount(0), 2500)
      return () => clearTimeout(reset)
    }
    const id = setTimeout(() => setVisibleCount((c) => c + 1), 600)
    return () => clearTimeout(id)
  }, [visibleCount])

  return (
    <section className="border-y border-border bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            AI extraction
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Watch AI read your contract in seconds
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Termly extracts structured data from any document with confidence
            scores you can trust.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* document */}
          <Reveal delay={1}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="size-4" />
                Acme_Master_Services_Agreement.pdf
              </div>
              <div className="space-y-2.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2.5 rounded-full bg-muted"
                    style={{ width: `${[92, 78, 85, 60, 90, 70, 82, 55, 88, 74, 64, 80][i]}%` }}
                  />
                ))}
              </div>

              {/* scanning beam */}
              <motion.div
                className="pointer-events-none absolute inset-x-6 h-16 rounded-xl bg-gradient-to-b from-primary/0 via-primary/15 to-primary/0"
                animate={{ top: ['12%', '78%', '12%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" />
                Analyzing document…
              </div>
            </div>
          </Reveal>

          {/* extracted fields */}
          <Reveal delay={2}>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Extracted Fields</h3>
                <span className="text-xs text-muted-foreground">
                  {Math.min(visibleCount, fields.length)} / {fields.length}
                </span>
              </div>
              <ul className="space-y-2">
                {fields.map((field, i) => (
                  <li key={field.label}>
                    <AnimatePresence>
                      {i < visibleCount && (
                        <motion.div
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                          className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3"
                        >
                          <CheckCircle2 className="size-4 shrink-0 text-accent" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">
                              {field.label}
                            </p>
                            <p className="truncate text-sm font-medium">
                              {field.value}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-primary">
                              {field.confidence}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              confidence
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

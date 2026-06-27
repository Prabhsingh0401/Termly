'use client'

import { Star } from 'lucide-react'
import { Reveal } from './reveal'

const testimonials = [
  {
    quote:
      'Termly caught three auto-renewals we would have missed entirely. It paid for itself in the first month.',
    name: 'Sarah Chen',
    role: 'VP Finance, Northwind',
    initials: 'SC',
  },
  {
    quote:
      'Our procurement team finally has a single source of truth. Renewal chaos is gone and audits take minutes.',
    name: 'Marcus Reyes',
    role: 'Head of Procurement, Latitude',
    initials: 'MR',
  },
  {
    quote:
      'The extraction accuracy is genuinely impressive. We trust the data enough to drive board-level reporting.',
    name: 'Priya Anand',
    role: 'CFO, Brightwave',
    initials: 'PA',
  },
  {
    quote:
      'Setup took an afternoon. Within a week every vendor contract was centralized and monitored automatically.',
    name: 'David Okafor',
    role: 'Operations Lead, Meridian',
    initials: 'DO',
  },
  {
    quote:
      'The risk flags give us leverage in every renewal negotiation. We have cut recurring spend meaningfully.',
    name: 'Elena Volkov',
    role: 'Controller, Cascade',
    initials: 'EV',
  },
  {
    quote:
      'It is the first contract tool our whole team actually wants to use. Clean, fast, and genuinely intelligent.',
    name: 'Tom Bradley',
    role: 'COO, Stackline',
    initials: 'TB',
  },
]

export function Testimonials() {
  return (
    <section id="pricing" className="border-y border-border bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Trusted by teams
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Finance and procurement teams run on Termly
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i % 3}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="size-4 fill-accent text-accent"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

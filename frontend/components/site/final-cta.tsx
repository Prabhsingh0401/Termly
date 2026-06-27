'use client'

import { motion } from 'motion/react'
import { ArrowRight, Upload } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function FinalCta() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary px-6 py-16 text-center sm:px-12 lg:py-20"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 size-72 rounded-full bg-primary-foreground/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-10 size-80 rounded-full bg-accent/30 blur-3xl" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(to right, var(--primary-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--primary-foreground) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                maskImage:
                  'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
              }}
            />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
              Stop Losing Money to Missed Renewals.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg !text-primary-foreground">
              Upload your first contract and let Termly do the tracking.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/login"
                className={cn(buttonVariants({ size: 'lg' }), "gap-2 rounded-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 flex items-center justify-center")}
              >
                <Upload className="size-4" />
                Start Free
              </a>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-lg border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Schedule Demo
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

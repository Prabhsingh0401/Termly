'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, ChevronLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/components/providers/AuthProvider'
import { Toast } from '@/app/components/ui/Toast'


export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { login, signup, loading } = useAuth()
  const router = useRouter()
  const isSignUp = mode === 'signup'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (isSignUp) {
        await signup(email, password, name)
      } else {
        await login(email, password)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.')
    }
  }

  function switchMode(next: 'signin' | 'signup') {
    setMode(next)
    setShowPassword(false)
    setName('')
    setEmail('')
    setPassword('')
    setError(null)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — dark image panel */}
      <div className="relative hidden w-1/2 flex-col justify-end overflow-hidden bg-[oklch(0.10_0_0)] dark:bg-background p-12 lg:flex">
        {/* grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, oklch(1 0 0 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        {/* bottom copy */}
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white dark:text-muted-foreground">
            Termly
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold leading-tight text-white dark:text-muted-foreground">
            Never miss a contract renewal again.
          </h2>
          <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            Centralise every contract, track every deadline, and automate every
            renewal — all in one place.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex w-full flex-col bg-background px-6 py-10 lg:w-1/2 lg:px-16 lg:py-14">
        {/* back link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to home
          </Link>
        </div>

        {/* form centred vertically */}
        <div className="m-auto w-full max-w-sm">
          {/* heading */}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isSignUp
              ? 'Get started with Termly for free'
              : 'Enter your details to access your account'}
          </p>

          {error && <Toast message={error} onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Full Name — sign up only */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {!isSignUp && (
                <div className="flex justify-end">
                  <a href="#" className="text-xs text-muted-foreground hover:text-foreground">
                    Forgot password?
                  </a>
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {loading 
                ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                : (isSignUp ? 'Create account' : 'Sign in')}
            </Button>


          </form>

          {/* Toggle sign-in / sign-up */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
              className="font-semibold text-foreground hover:text-primary"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

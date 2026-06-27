
import { Features } from '@/components/site/features'
import { FinalCta } from '@/components/site/final-cta'
import { Footer } from '@/components/site/footer'
import { Hero } from '@/components/site/hero'
import { HowItWorks } from '@/components/site/how-it-works'

import { Navbar } from '@/components/site/navbar'
import { Problem } from '@/components/site/problem'
import { ProductShowcase } from '@/components/site/product-showcase'


export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <ProductShowcase />
        <Features />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}

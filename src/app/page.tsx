import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { HeaderSkeleton } from "@/components/layout/header-skeleton"
import {
  Hero,
  StatsSection,
  GuaranteesSection,
  PricesSection,
  TestimonialsSection,
  FaqSection,
  Footer,
  StatsSkeleton,
  GuaranteesSkeleton,
  PricesSkeleton,
  TestimonialsSkeleton,
  FaqSkeleton,
} from "@/components/landing"
import { ScrollToTop } from "@/components/ui/scroll-to-top"

/**
 * Landing Page - Optimisée pour un FCP ultra-rapide
 * 
 * Architecture Streaming SSR:
 * - Le Hero est 100% statique → rendu immédiat
 * - Chaque section fetch ses propres données avec Suspense
 * - Les skeletons s'affichent instantanément pendant le chargement
 * 
 * Résultat: FCP < 1s même sur connexion lente
 */

// Force static generation - la landing page est quasi-statique
export const dynamic = 'force-static'
export const revalidate = 3600

export default function Home() {
  return (
    <>
      {/* Header avec Suspense - Logo visible instantanément */}
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>

      <main className="min-h-screen">
        {/* Hero - 100% statique, rendu immédiat */}
        <Hero />

        {/* Sections avec données - streaming SSR avec skeletons */}
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>

        <Suspense fallback={<GuaranteesSkeleton />}>
          <GuaranteesSection />
        </Suspense>

        <Suspense fallback={<PricesSkeleton />}>
          <PricesSection />
        </Suspense>

        <Suspense fallback={<TestimonialsSkeleton />}>
          <TestimonialsSection />
        </Suspense>

        <Suspense fallback={<FaqSkeleton />}>
          <FaqSection />
        </Suspense>

        {/* Footer - statique */}
        <Footer />

        {/* ScrollToTop - client component léger */}
        <ScrollToTop />
      </main>
    </>
  )
}

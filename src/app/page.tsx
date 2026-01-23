import { Header } from "@/components/layout/header"
import {
  Hero,
  Stats,
  Guarantees,
  Prices,
  Testimonials,
  Faq,
  Footer,
} from "@/components/landing"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import { getLandingPageData } from "@/lib/api/landing"
import { getUser } from "@/lib/supabase/server"

// ISR: Revalider la page toutes les heures pour améliorer FCP/LCP
export const revalidate = 3600

export default async function Home() {
  const [{ stats, testimonials, faq, prices, guarantees }, user] = await Promise.all([
    getLandingPageData(),
    getUser()
  ])

  const isLoggedIn = !!user

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero isLoggedIn={isLoggedIn} />
        <Stats stats={stats} />
        <Guarantees guarantees={guarantees} />
        <Prices prices={prices} />
        <Testimonials testimonials={testimonials} />
        <Faq faq={faq} />
        <Footer />
        <ScrollToTop />
      </main>
    </>
  )
}

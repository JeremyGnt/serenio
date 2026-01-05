import { Header } from "@/components/layout/header"
import {
  Hero,
  Stats,
  Guarantees,
  Prices,
  Testimonials,
  LeadForm,
  Faq,
  Footer,
} from "@/components/landing"
import { getLandingPageData } from "@/lib/api/landing"

export default async function Home() {
  const { stats, testimonials, faq, prices, guarantees } = await getLandingPageData()

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero : CTA principal */}
        <Hero />

        {/* Stats : preuves sociales rapides */}
        <Stats stats={stats} />

        {/* Garanties : pourquoi nous faire confiance */}
        <Guarantees guarantees={guarantees} />

        {/* Prix : transparence totale */}
        <Prices prices={prices} />

        {/* Témoignages : validation sociale */}
        <Testimonials testimonials={testimonials} />

        {/* Lead form : capture */}
        <LeadForm />

        {/* FAQ : lever les objections */}
        <Faq faq={faq} />

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}

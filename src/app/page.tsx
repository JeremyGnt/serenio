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
import { getLandingPageData } from "@/lib/api/landing"

export default async function Home() {
  const { stats, testimonials, faq, prices, guarantees } = await getLandingPageData()

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero />
        <Stats stats={stats} />
        <Guarantees guarantees={guarantees} />
        <Prices prices={prices} />
        <Testimonials testimonials={testimonials} />
        <Faq faq={faq} />
        <Footer />
      </main>
    </>
  )
}

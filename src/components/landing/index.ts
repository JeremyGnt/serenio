export { Hero } from "./hero"
export { Stats } from "./stats"
export { Guarantees } from "./guarantees"
export { Prices } from "./prices"
export { Testimonials } from "./testimonials"
export { Faq } from "./faq"
export { Footer } from "./footer"

// Section components avec data-fetching intégré (pour Suspense streaming)
export { StatsSection } from "./stats-section"
export { GuaranteesSection } from "./guarantees-section"
export { PricesSection } from "./prices-section"
export { TestimonialsSection } from "./testimonials-section"
export { FaqSection } from "./faq-section"

// Skeletons pour le streaming SSR
export {
    StatsSkeleton,
    GuaranteesSkeleton,
    PricesSkeleton,
    TestimonialsSkeleton,
    FaqSkeleton,
} from "./landing-skeletons"

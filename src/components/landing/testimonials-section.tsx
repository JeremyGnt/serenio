/**
 * Section Testimonials - Composant async qui fetch ses propres données
 * Utilisé avec Suspense pour le streaming SSR
 */
import { getTestimonials } from "@/lib/api/landing"
import { Testimonials } from "./testimonials"

export async function TestimonialsSection() {
    const testimonials = await getTestimonials()
    return <Testimonials testimonials={testimonials} />
}

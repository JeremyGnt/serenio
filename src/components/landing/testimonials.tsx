import { Star } from "lucide-react"
import type { Testimonial } from "@/types/landing"

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  // Afficher 3 témoignages max
  const displayedTestimonials = testimonials.slice(0, 3)

  return (
    <section className="px-4 py-12">
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-center mb-8">
          Ce qu'en disent nos clients
        </h2>

        <div className="space-y-6">
          {displayedTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="border border-border rounded-lg p-4"
            >
              {/* Étoiles */}
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Contenu */}
              <p className="text-sm leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Auteur */}
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {testimonial.author_name}
                </span>
                {" · "}
                {testimonial.author_location}
                {" · "}
                <span className="capitalize">{testimonial.intervention_type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


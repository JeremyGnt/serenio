"use client"

import { Star, Quote } from "lucide-react"
import type { Testimonial } from "@/types/landing"

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const displayedTestimonials = testimonials.slice(0, 3)

  return (
    <section className="px-4 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-slate-600">
            Découvrez les avis de nos clients à Lyon
          </p>
        </div>

        {/* Grille de témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-100 group-hover:text-emerald-100 transition-colors" />

              {/* Étoiles */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-100 text-slate-200"
                    }`}
                  />
                ))}
              </div>

              {/* Contenu */}
              <p className="text-slate-700 leading-relaxed mb-6 relative z-10">
                "{testimonial.content}"
              </p>

              {/* Auteur */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.author_name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    {testimonial.author_name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {testimonial.author_location} · <span className="capitalize">{testimonial.intervention_type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"
import type { FaqItem } from "@/types/landing"

interface FaqProps {
  faq: FaqItem[]
}

export function Faq({ faq }: FaqProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <section className="px-4 py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
            <HelpCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-lg text-slate-600">
            Tout ce que vous devez savoir avant de faire appel à nos services
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faq.map((item, index) => {
            const isOpen = openId === item.id
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-300 ${
                  isOpen 
                    ? "border-emerald-200 shadow-lg shadow-emerald-100/50" 
                    : "border-slate-200 hover:border-slate-300"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className={`font-medium pr-4 transition-colors ${
                    isOpen ? "text-emerald-700" : "text-slate-900"
                  }`}>
                    {item.question}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isOpen 
                      ? "bg-emerald-100 rotate-180" 
                      : "bg-slate-100"
                  }`}>
                    <ChevronDown className={`w-5 h-5 transition-colors ${
                      isOpen ? "text-emerald-600" : "text-slate-500"
                    }`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-96" : "max-h-0"
                }`}>
                  <div className="px-5 pb-5">
                    <p className="text-slate-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

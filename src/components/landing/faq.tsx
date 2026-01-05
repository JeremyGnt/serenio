"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
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
    <section className="px-4 py-12">
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-center mb-8">
          Questions fréquentes
        </h2>

        <div className="space-y-2">
          {faq.map((item) => {
            const isOpen = openId === item.id
            return (
              <div
                key={item.id}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-sm font-medium pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


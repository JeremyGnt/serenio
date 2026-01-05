"use client"

import { useEffect, useState, useRef } from "react"
import { Users, Clock, Star, ThumbsUp } from "lucide-react"
import type { PlatformStats } from "@/types/landing"

interface StatsProps {
  stats: PlatformStats
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 1500
    const steps = 40
    const stepValue = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold text-slate-900">
      {displayValue}{suffix}
    </div>
  )
}

export function Stats({ stats }: StatsProps) {
  const items = [
    {
      value: stats.interventions_completed,
      label: "Interventions réalisées",
      suffix: "+",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      value: stats.average_response_minutes,
      label: "Minutes de réponse",
      suffix: "",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      value: stats.average_rating,
      label: "Note moyenne",
      suffix: "/5",
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      value: stats.satisfaction_rate,
      label: "Clients satisfaits",
      suffix: "%",
      icon: ThumbsUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ]

  return (
    <section className="px-4 py-10 md:py-12 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <div 
                key={item.label} 
                className="text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${item.bg} rounded-xl mb-4`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <AnimatedNumber value={item.value} suffix={item.suffix} />
                <div className="text-sm text-slate-600 mt-2">
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import type { PlatformStats } from "@/types/landing"

interface StatsProps {
  stats: PlatformStats
}

export function Stats({ stats }: StatsProps) {
  const items = [
    {
      value: stats.interventions_completed,
      label: "Interventions",
      suffix: "+",
    },
    {
      value: stats.average_response_minutes,
      label: "Min en moyenne",
      suffix: "",
    },
    {
      value: stats.average_rating,
      label: "Note clients",
      suffix: "★",
    },
    {
      value: stats.satisfaction_rate,
      label: "Satisfaits",
      suffix: "%",
    },
  ]

  return (
    <section className="px-4 py-10 bg-secondary/50">
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold">
                {item.value}{item.suffix}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


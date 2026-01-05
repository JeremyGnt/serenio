import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <h1 className="text-4xl font-bold">Serenio</h1>
      <p className="text-muted-foreground text-center max-w-xl">
        Une plateforme de confiance pour trouver un serrurier vérifié à Lyon,
        avec un prix cadré et sans surprise.
      </p>
      <Button asChild>
        <Link href="/demande">Créer une demande</Link>
      </Button>
    </main>
  )
}

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DemandePage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Créer une demande</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Urgence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Porte claquée, perte de clés… intervention à Lyon.
            </p>
            <Button asChild className="w-full">
              <Link href="/diagnostic?type=urgence">Continuer</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Changement de serrure, sécurisation… planifie un créneau.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/diagnostic?type=rdv">Continuer</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

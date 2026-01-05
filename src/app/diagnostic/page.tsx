import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function DiagnosticPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Diagnostic</h1>

      <Card>
        <CardHeader>
          <CardTitle>Décris la situation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Adresse (Lyon)</Label>
            <Input id="address" placeholder="Ex: 12 rue …, 69003 Lyon" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" placeholder="Ex: 06…" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Détails</Label>
            <Textarea
              id="details"
              placeholder="Ex: porte claquée, clés à l’intérieur, immeuble…"
            />
          </div>

          <div className="flex gap-3">
            <Button asChild variant="secondary">
              <Link href="/demande">Retour</Link>
            </Button>
            <Button asChild>
              <Link href="/suivi/demo-123">Envoyer la demande</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

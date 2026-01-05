import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SuiviPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Suivi</h1>

      <Card>
        <CardHeader>
          <CardTitle>Demande #{id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Statut (MVP) : demande reçue ✅
          </p>
          <ul className="list-disc pl-5 text-sm">
            <li>Réception de la demande</li>
            <li>Assignation d’un serrurier</li>
            <li>Intervention</li>
            <li>Avis</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}

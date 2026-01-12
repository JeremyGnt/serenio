import { NextRequest, NextResponse } from "next/server"
import { deleteInterventionPhoto } from "@/lib/storage"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * DELETE /api/photos/delete/[photoId]
 * Supprime une photo (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params

    const result = await deleteInterventionPhoto(photoId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur API delete photo:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

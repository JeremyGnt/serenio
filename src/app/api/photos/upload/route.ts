import { NextRequest, NextResponse } from "next/server"
import { uploadInterventionPhoto, STORAGE_CONFIG } from "@/lib/storage"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/photos/upload
 * Upload une photo pour une intervention
 * 
 * FormData:
 * - file: File (image)
 * - interventionId: string
 * - photoType?: "diagnostic" | "before" | "after" | "invoice"
 * - rgpdConsent?: "true" | "false"
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const file = formData.get("file") as File | null
    const interventionId = formData.get("interventionId") as string | null
    const photoType = (formData.get("photoType") as string) || "diagnostic"
    const rgpdConsent = formData.get("rgpdConsent") === "true"

    // Validations
    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni", errorCode: "UPLOAD_FAILED" },
        { status: 400 }
      )
    }

    if (!interventionId) {
      return NextResponse.json(
        { success: false, error: "ID d'intervention manquant", errorCode: "INTERVENTION_NOT_FOUND" },
        { status: 400 }
      )
    }

    // Valider le type MIME
    if (!STORAGE_CONFIG.allowedMimeTypes.includes(file.type as typeof STORAGE_CONFIG.allowedMimeTypes[number])) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.", 
          errorCode: "INVALID_FILE_TYPE" 
        },
        { status: 400 }
      )
    }

    // Valider la taille
    if (file.size > STORAGE_CONFIG.maxFileSizeBytes) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Fichier trop volumineux. Max ${STORAGE_CONFIG.maxFileSizeMB} Mo.`, 
          errorCode: "FILE_TOO_LARGE" 
        },
        { status: 400 }
      )
    }

    // Convertir en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Upload via la fonction serveur
    const result = await uploadInterventionPhoto(
      interventionId,
      arrayBuffer,
      file.name,
      file.type,
      file.size,
      photoType as "diagnostic" | "before" | "after" | "invoice",
      rgpdConsent
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, errorCode: result.errorCode },
        { status: result.errorCode === "UNAUTHORIZED" ? 403 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      photo: result.photo,
    })
  } catch (error) {
    console.error("Erreur API upload:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur", errorCode: "UNKNOWN_ERROR" },
      { status: 500 }
    )
  }
}

"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import {
  STORAGE_CONFIG,
  generateStoragePath,
  generatePhotoId,
  type UploadedPhoto,
  type PhotoUploadResult,
  type PhotoErrorCode,
} from "./config"

// ============================================
// UPLOAD DE PHOTOS
// ============================================

/**
 * Upload une photo pour une intervention (côté serveur)
 * Gère la validation, le stockage et l'enregistrement en DB
 */
export async function uploadInterventionPhoto(
  interventionId: string,
  fileBuffer: ArrayBuffer,
  filename: string,
  mimeType: string,
  fileSize: number,
  photoType: "diagnostic" | "before" | "after" | "invoice" = "diagnostic",
  rgpdConsent: boolean = false
): Promise<PhotoUploadResult> {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  try {
    // Vérifier l'utilisateur (peut être null pour les demandes anonymes)
    const { data: { user } } = await supabase.auth.getUser()

    // Vérifier que l'intervention existe
    const { data: intervention, error: interventionError } = await adminClient
      .from("intervention_requests")
      .select("id, client_id, client_email, status")
      .eq("id", interventionId)
      .single()

    if (interventionError || !intervention) {
      return { success: false, error: "Intervention non trouvée", errorCode: "INTERVENTION_NOT_FOUND" }
    }

    // Vérifier l'autorisation
    // Pour les utilisateurs connectés: vérifier qu'ils sont propriétaires ou artisan assigné
    // Pour les demandes récentes sans utilisateur connecté: autoriser si l'intervention est en draft/pending
    const isOwner = user?.id === intervention.client_id ||
      user?.email === intervention.client_email

    // Permettre l'upload pour les interventions récentes en draft/pending (demandes anonymes)
    // L'intervention vient d'être créée, l'utilisateur peut ajouter des photos
    const isRecentAnonymousRequest = !user &&
      ['draft', 'pending'].includes(intervention.status) &&
      !intervention.client_id // Pas de client_id = demande anonyme

    // Pour les artisans, vérifier s'ils sont assignés
    let isAssignedArtisan = false
    if (user && !isOwner) {
      const { data: assignment } = await adminClient
        .from("artisan_assignments")
        .select("id")
        .eq("intervention_id", interventionId)
        .eq("artisan_id", user.id)
        .eq("status", "accepted")
        .single()

      isAssignedArtisan = !!assignment
    }

    if (!isOwner && !isAssignedArtisan && !isRecentAnonymousRequest) {
      return { success: false, error: "Non autorisé", errorCode: "UNAUTHORIZED" }
    }

    // Vérifier le nombre de photos existantes (compatible avec/sans migration 011)
    const { count: existingCount } = await adminClient
      .from("intervention_photos")
      .select("*", { count: "exact", head: true })
      .eq("intervention_id", interventionId)

    if ((existingCount || 0) >= STORAGE_CONFIG.maxPhotosPerIntervention) {
      return {
        success: false,
        error: `Maximum ${STORAGE_CONFIG.maxPhotosPerIntervention} photos par intervention`,
        errorCode: "TOO_MANY_PHOTOS"
      }
    }

    // Valider le type MIME
    if (!STORAGE_CONFIG.allowedMimeTypes.includes(mimeType as typeof STORAGE_CONFIG.allowedMimeTypes[number])) {
      return { success: false, error: "Type de fichier non autorisé", errorCode: "INVALID_FILE_TYPE" }
    }

    // Valider la taille
    if (fileSize > STORAGE_CONFIG.maxFileSizeBytes) {
      return { success: false, error: "Fichier trop volumineux", errorCode: "FILE_TOO_LARGE" }
    }

    // Générer l'ID et le chemin
    const photoId = generatePhotoId()
    const storagePath = generateStoragePath(interventionId, filename, photoId)

    // Upload vers Supabase Storage (avec le service role pour avoir accès au bucket privé)
    const { error: uploadError } = await adminClient.storage
      .from(STORAGE_CONFIG.bucket)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Erreur upload storage:", uploadError)
      return { success: false, error: "Erreur lors de l'upload", errorCode: "STORAGE_ERROR" }
    }

    // Enregistrer en base de données
    // Structure de base compatible avec migration 005
    const photoRecord: Record<string, unknown> = {
      id: photoId,
      intervention_id: interventionId,
      storage_path: storagePath,
      original_filename: filename,
      mime_type: mimeType,
      file_size_bytes: fileSize,
      photo_type: photoType,
      uploaded_by: user?.id || null,
      uploaded_by_role: isAssignedArtisan ? "artisan" : "client",
    }

    // Ajouter les colonnes RGPD si la migration 011 a été appliquée
    // Ces colonnes sont optionnelles et seront ignorées si elles n'existent pas
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + STORAGE_CONFIG.retentionDays)

      photoRecord.rgpd_consent = rgpdConsent
      photoRecord.rgpd_consent_at = rgpdConsent ? new Date().toISOString() : null
      photoRecord.expires_at = expiresAt.toISOString()
      photoRecord.is_deleted = false
    } catch {
      // Colonnes RGPD non disponibles, continuer sans
    }

    const { data: photo, error: dbError } = await adminClient
      .from("intervention_photos")
      .insert(photoRecord)
      .select()
      .single()

    if (dbError) {
      // Rollback: supprimer le fichier du storage
      await adminClient.storage.from(STORAGE_CONFIG.bucket).remove([storagePath])
      console.error("Erreur insertion DB:", dbError)
      return { success: false, error: "Erreur lors de l'enregistrement", errorCode: "STORAGE_ERROR" }
    }

    return {
      success: true,
      photo: {
        id: photo.id,
        interventionId: photo.intervention_id,
        storagePath: photo.storage_path,
        originalFilename: photo.original_filename,
        mimeType: photo.mime_type,
        fileSizeBytes: photo.file_size_bytes,
        photoType: photo.photo_type,
        createdAt: photo.created_at,
      },
    }
  } catch (error) {
    console.error("Erreur uploadInterventionPhoto:", error)
    return { success: false, error: "Erreur inattendue", errorCode: "UNKNOWN_ERROR" }
  }
}

/**
 * Upload plusieurs photos en parallèle
 */
export async function uploadInterventionPhotos(
  interventionId: string,
  files: Array<{
    buffer: ArrayBuffer
    filename: string
    mimeType: string
    size: number
  }>,
  photoType: "diagnostic" | "before" | "after" | "invoice" = "diagnostic",
  rgpdConsent: boolean = false
): Promise<{
  success: boolean
  results: Array<PhotoUploadResult>
  uploadedCount: number
  failedCount: number
}> {
  const results: PhotoUploadResult[] = []
  let uploadedCount = 0
  let failedCount = 0

  // Upload en série pour éviter les race conditions sur le count
  for (const file of files) {
    const result = await uploadInterventionPhoto(
      interventionId,
      file.buffer,
      file.filename,
      file.mimeType,
      file.size,
      photoType,
      rgpdConsent
    )

    results.push(result)

    if (result.success) {
      uploadedCount++
    } else {
      failedCount++
    }
  }

  return {
    success: failedCount === 0,
    results,
    uploadedCount,
    failedCount,
  }
}

// ============================================
// SUPPRESSION DE PHOTOS
// ============================================

/**
 * Supprime une photo (soft delete)
 */
export async function deleteInterventionPhoto(
  photoId: string,
  hardDelete: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Récupérer la photo
    const { data: photo, error: fetchError } = await adminClient
      .from("intervention_photos")
      .select("*, intervention_requests!inner(client_id, client_email, status)")
      .eq("id", photoId)
      .single()

    if (fetchError || !photo) {
      return { success: false, error: "Photo non trouvée" }
    }

    // Vérifier l'autorisation (propriétaire ou service role)
    const intervention = photo.intervention_requests
    const isOwner = user?.id === intervention.client_id ||
      user?.email === intervention.client_email

    if (!isOwner) {
      return { success: false, error: "Non autorisé à supprimer cette photo" }
    }

    // Vérifier que l'intervention est encore modifiable
    if (!["draft", "pending"].includes(intervention.status)) {
      return { success: false, error: "La demande ne peut plus être modifiée" }
    }

    if (hardDelete) {
      // Suppression définitive du storage
      await adminClient.storage.from(STORAGE_CONFIG.bucket).remove([photo.storage_path])

      // Suppression en DB
      await adminClient.from("intervention_photos").delete().eq("id", photoId)
    } else {
      // Soft delete
      await adminClient
        .from("intervention_photos")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", photoId)
    }

    return { success: true }
  } catch (error) {
    console.error("Erreur deleteInterventionPhoto:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

// ============================================
// RÉCUPÉRATION DE PHOTOS
// ============================================

/**
 * Récupère les photos d'une intervention
 */
export async function getInterventionPhotos(
  interventionId: string
): Promise<UploadedPhoto[]> {
  const adminClient = createAdminClient()

  try {
    // Requête de base sans filtre is_deleted pour compatibilité
    const { data: photos, error } = await adminClient
      .from("intervention_photos")
      .select("*")
      .eq("intervention_id", interventionId)
      .order("created_at", { ascending: true })

    if (error || !photos) {
      console.error("Erreur getInterventionPhotos:", error)
      return []
    }

    // Filtrer les photos supprimées si la colonne existe
    const activePhotos = photos.filter(photo =>
      photo.is_deleted === undefined || photo.is_deleted === false
    )

    return activePhotos.map((photo) => ({
      id: photo.id,
      interventionId: photo.intervention_id,
      storagePath: photo.storage_path,
      originalFilename: photo.original_filename,
      mimeType: photo.mime_type,
      fileSizeBytes: photo.file_size_bytes,
      photoType: photo.photo_type,
      createdAt: photo.created_at,
    }))
  } catch (error) {
    console.error("Erreur getInterventionPhotos:", error)
    return []
  }
}

// ============================================
// URLS SIGNÉES
// ============================================

/**
 * Génère une URL signée pour accéder à une photo
 * L'URL est temporaire et expire après 1 heure
 */
export async function getSignedPhotoUrl(
  storagePath: string
): Promise<{ url: string | null; error?: string }> {
  const adminClient = createAdminClient()

  try {
    const { data, error } = await adminClient.storage
      .from(STORAGE_CONFIG.bucket)
      .createSignedUrl(storagePath, STORAGE_CONFIG.signedUrlExpiry)

    if (error || !data?.signedUrl) {
      console.error("Erreur getSignedPhotoUrl:", error)
      return { url: null, error: "Impossible de générer l'URL" }
    }

    return { url: data.signedUrl }
  } catch (error) {
    console.error("Erreur getSignedPhotoUrl:", error)
    return { url: null, error: "Erreur lors de la génération de l'URL" }
  }
}

/**
 * Génère des URLs signées pour plusieurs photos
 */
export async function getSignedPhotoUrls(
  photos: UploadedPhoto[]
): Promise<UploadedPhoto[]> {
  const adminClient = createAdminClient()

  try {
    // Utiliser createSignedUrls pour batch
    const paths = photos.map((p) => p.storagePath)

    const { data, error } = await adminClient.storage
      .from(STORAGE_CONFIG.bucket)
      .createSignedUrls(paths, STORAGE_CONFIG.signedUrlExpiry)

    if (error || !data) {
      console.error("Erreur getSignedPhotoUrls:", error)
      return photos // Retourner sans URLs
    }

    // Associer les URLs aux photos
    return photos.map((photo, index) => ({
      ...photo,
      url: data[index]?.signedUrl || undefined,
    }))
  } catch (error) {
    console.error("Erreur getSignedPhotoUrls:", error)
    return photos
  }
}

/**
 * Récupère les photos avec URLs signées
 */
export async function getInterventionPhotosWithUrls(
  interventionId: string
): Promise<UploadedPhoto[]> {
  const photos = await getInterventionPhotos(interventionId)

  if (photos.length === 0) {
    return []
  }

  return getSignedPhotoUrls(photos)
}

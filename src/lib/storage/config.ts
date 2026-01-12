/**
 * Configuration et utilitaires pour le Storage Supabase
 * Bucket intervention-photos (PRIVÉ)
 */

// ============================================
// CONFIGURATION
// ============================================

export const STORAGE_CONFIG = {
  bucket: "intervention-photos",
  maxFileSizeMB: 5,
  maxFileSizeBytes: 5 * 1024 * 1024, // 5 Mo
  maxPhotosPerIntervention: 5,
  allowedMimeTypes: [
    "image/jpeg",
    "image/png", 
    "image/webp",
    "image/heic",
    "image/heif",
  ],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"],
  // Durée de validité des URLs signées (en secondes)
  signedUrlExpiry: 3600, // 1 heure
  // Conservation des photos après intervention terminée (en jours)
  retentionDays: 90,
} as const

// ============================================
// TYPES
// ============================================

export interface UploadedPhoto {
  id: string
  interventionId: string
  storagePath: string
  originalFilename: string
  mimeType: string
  fileSizeBytes: number
  photoType: "diagnostic" | "before" | "after" | "invoice"
  createdAt: string
  url?: string // URL signée (calculée à la demande)
}

export interface PhotoUploadResult {
  success: boolean
  error?: string
  errorCode?: PhotoErrorCode
  photo?: UploadedPhoto
}

export interface PhotoUploadProgress {
  photoId: string
  filename: string
  progress: number // 0-100
  status: "pending" | "uploading" | "processing" | "complete" | "error"
  error?: string
}

export type PhotoErrorCode =
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "TOO_MANY_PHOTOS"
  | "UPLOAD_FAILED"
  | "INTERVENTION_NOT_FOUND"
  | "UNAUTHORIZED"
  | "STORAGE_ERROR"
  | "UNKNOWN_ERROR"

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Vérifie si un fichier est un type d'image autorisé
 */
export function isValidImageType(file: File): boolean {
  // Vérification du MIME type
  if (!STORAGE_CONFIG.allowedMimeTypes.includes(file.type as typeof STORAGE_CONFIG.allowedMimeTypes[number])) {
    return false
  }

  // Vérification de l'extension (backup)
  const extension = "." + file.name.split(".").pop()?.toLowerCase()
  if (!STORAGE_CONFIG.allowedExtensions.includes(extension as typeof STORAGE_CONFIG.allowedExtensions[number])) {
    return false
  }

  return true
}

/**
 * Vérifie si un fichier est dans la limite de taille
 */
export function isValidFileSize(file: File): boolean {
  return file.size <= STORAGE_CONFIG.maxFileSizeBytes
}

/**
 * Valide un fichier et retourne l'erreur éventuelle
 */
export function validatePhotoFile(file: File): { valid: boolean; error?: string; code?: PhotoErrorCode } {
  if (!isValidImageType(file)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP, HEIC`,
      code: "INVALID_FILE_TYPE",
    }
  }

  if (!isValidFileSize(file)) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille max : ${STORAGE_CONFIG.maxFileSizeMB} Mo`,
      code: "FILE_TOO_LARGE",
    }
  }

  return { valid: true }
}

/**
 * Valide plusieurs fichiers
 */
export function validatePhotoFiles(
  files: File[],
  currentCount: number = 0
): { valid: boolean; errors: Array<{ filename: string; error: string }> } {
  const errors: Array<{ filename: string; error: string }> = []

  // Vérifier le nombre total
  if (currentCount + files.length > STORAGE_CONFIG.maxPhotosPerIntervention) {
    return {
      valid: false,
      errors: [
        {
          filename: "",
          error: `Nombre maximum de photos atteint (${STORAGE_CONFIG.maxPhotosPerIntervention})`,
        },
      ],
    }
  }

  // Valider chaque fichier
  for (const file of files) {
    const validation = validatePhotoFile(file)
    if (!validation.valid) {
      errors.push({
        filename: file.name,
        error: validation.error || "Fichier invalide",
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================
// PATH HELPERS
// ============================================

/**
 * Génère un chemin de stockage sécurisé
 */
export function generateStoragePath(
  interventionId: string,
  filename: string,
  photoId: string
): string {
  // Extraire l'extension
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg"
  
  // Chemin: {intervention_id}/{photo_id}.{ext}
  return `${interventionId}/${photoId}.${extension}`
}

/**
 * Génère un ID unique pour une photo (UUID v4)
 */
export function generatePhotoId(): string {
  // Générer un UUID v4 compatible avec PostgreSQL
  return crypto.randomUUID()
}

// ============================================
// ERROR MESSAGES
// ============================================

export const PHOTO_ERROR_MESSAGES: Record<PhotoErrorCode, string> = {
  INVALID_FILE_TYPE: "Ce type de fichier n'est pas autorisé. Utilisez JPG, PNG ou WebP.",
  FILE_TOO_LARGE: `La photo est trop volumineuse. Taille maximum : ${STORAGE_CONFIG.maxFileSizeMB} Mo.`,
  TOO_MANY_PHOTOS: `Vous ne pouvez pas ajouter plus de ${STORAGE_CONFIG.maxPhotosPerIntervention} photos.`,
  UPLOAD_FAILED: "L'envoi de la photo a échoué. Veuillez réessayer.",
  INTERVENTION_NOT_FOUND: "Demande d'intervention non trouvée.",
  UNAUTHORIZED: "Vous n'êtes pas autorisé à ajouter des photos à cette demande.",
  STORAGE_ERROR: "Erreur lors du stockage de la photo. Veuillez réessayer.",
  UNKNOWN_ERROR: "Une erreur inattendue s'est produite. Veuillez réessayer.",
}

export function getPhotoErrorMessage(code: PhotoErrorCode): string {
  return PHOTO_ERROR_MESSAGES[code] || PHOTO_ERROR_MESSAGES.UNKNOWN_ERROR
}

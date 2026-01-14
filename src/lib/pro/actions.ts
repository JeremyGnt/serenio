"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface ActionResult {
  success: boolean
  error?: string
  data?: any
}

/**
 * Met à jour la photo de profil de l'artisan
 */
export async function updateArtisanAvatar(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { success: false, error: "Non connecté" }
  }

  const file = formData.get("file") as File
  if (!file) {
    return { success: false, error: "Aucun fichier" }
  }

  // Validation taille
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Fichier trop volumineux (max 5 Mo)" }
  }

  // Upload to Storage
  const fileExt = file.name.split('.').pop()
  const filePath = `${userData.user.id}/profile.${fileExt}`

  // On écrase l'ancien fichier s'il existe
  const { error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error("Supabase Storage Error:", uploadError) // Debug log
    return { success: false, error: "Erreur lors de l'upload: " + uploadError.message }
  }

  // Get Public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Force cache bust
  const publicUrlWithCacheBust = `${publicUrl}?t=${new Date().getTime()}`

  // Update Auth Metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      avatar_url: publicUrlWithCacheBust,
      picture: publicUrlWithCacheBust, // Sync picture for compatibility
      custom_avatar_url: publicUrlWithCacheBust, // Custom URL that persists over Google Auth
    }
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  revalidatePath("/pro/compte")
  return { success: true, data: { publicUrl: publicUrlWithCacheBust } }
}

/**
 * Supprime la photo de profil
 */
export async function deleteArtisanAvatar(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { success: false, error: "Non connecté" }
  }

  // On essaie de lister les fichiers pour trouver le bon nom/extension
  const { data: files } = await supabase
    .storage
    .from('avatars')
    .list(userData.user.id)

  if (files && files.length > 0) {
    const pathsToRemove = files.map(f => `${userData.user.id}/${f.name}`)
    await supabase.storage.from('avatars').remove(pathsToRemove)
  }

  // Update Auth Metadata to null
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      avatar_url: null,
      picture: null,
      custom_avatar_url: null
    }
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  revalidatePath("/pro/compte")
  return { success: true }
}

/**
 * Met à jour les infos entreprise de l'artisan
 */
export async function updateArtisanCompany(data: {
  companyName: string
  siret: string
  experience?: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { success: false, error: "Non connecté" }
  }

  // Mise à jour auth metadata
  const { error } = await supabase.auth.updateUser({
    data: {
      company_name: data.companyName,
      experience: data.experience,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Mise à jour table artisans
  await supabase
    .from("artisans")
    .update({
      company_name: data.companyName,
      experience: data.experience,
    })
    .eq("id", userData.user.id)

  revalidatePath("/pro/compte")
  return { success: true }
}

/**
 * Met à jour les infos contact de l'artisan
 */
export async function updateArtisanContact(data: {
  firstName: string
  lastName: string
  phone: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { success: false, error: "Non connecté" }
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: data.firstName,
      last_name: data.lastName,
      full_name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  await supabase
    .from("artisans")
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
    })
    .eq("id", userData.user.id)

  revalidatePath("/pro/compte")
  return { success: true }
}

/**
 * Met à jour l'adresse et zone d'intervention
 */
export async function updateArtisanAddress(data: {
  street: string
  postalCode: string
  city: string
  availabilityRadius: number
  latitude?: number | null
  longitude?: number | null
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { success: false, error: "Non connecté" }
  }

  // Mise à jour auth metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      street: data.street,
      postal_code: data.postalCode,
      city: data.city,
      availability_radius_km: data.availabilityRadius,
      base_latitude: data.latitude,
      base_longitude: data.longitude,
    },
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  // Utiliser le client admin pour bypasser RLS
  const { createAdminClient } = await import("@/lib/supabase/admin")
  const adminClient = createAdminClient()

  const { error: dbError } = await adminClient
    .from("artisans")
    .update({
      street: data.street,
      postal_code: data.postalCode,
      city: data.city,
      availability_radius_km: data.availabilityRadius,
      base_latitude: data.latitude,
      base_longitude: data.longitude,
    })
    .eq("id", userData.user.id)

  if (dbError) {
    console.error("Erreur mise à jour artisan:", dbError)
    return { success: false, error: dbError.message }
  }

  revalidatePath("/pro/compte")
  return { success: true }
}

/**
 * Met à jour le statut de disponibilité de l'artisan
 */
export async function updateArtisanAvailability(isAvailable: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { success: false, error: "Non connecté" }
  }

  // Vérifier que l'utilisateur est un artisan
  const role = userData.user.user_metadata?.role
  if (role !== "artisan" && role !== "artisan_pending") {
    return { success: false, error: "Accès réservé aux artisans" }
  }

  // Utiliser le client admin pour bypasser RLS
  const { createAdminClient } = await import("@/lib/supabase/admin")
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from("artisans")
    .update({ is_available: isAvailable })
    .eq("id", userData.user.id)
    .select()

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data || data.length === 0) {
    return { success: false, error: "Artisan non trouvé" }
  }

  revalidatePath("/pro")
  return { success: true }
}



"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface ActionResult {
  success: boolean
  error?: string
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
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { success: false, error: "Non connecté" }
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      street: data.street,
      postal_code: data.postalCode,
      city: data.city,
      availability_radius_km: data.availabilityRadius,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  await supabase
    .from("artisans")
    .update({
      street: data.street,
      postal_code: data.postalCode,
      city: data.city,
      availability_radius_km: data.availabilityRadius,
    })
    .eq("id", userData.user.id)

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



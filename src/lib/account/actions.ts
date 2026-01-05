"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

interface ActionResult {
  success: boolean
  error?: string
}

/**
 * Met à jour les informations personnelles
 */
export async function updateProfile(data: {
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
    .from("profiles")
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
    })
    .eq("id", userData.user.id)

  revalidatePath("/compte")
  return { success: true }
}

/**
 * Met à jour l'adresse
 */
export async function updateAddress(data: {
  street: string
  postalCode: string
  city: string
  country: string
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
      country: data.country,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  await supabase
    .from("profiles")
    .update({
      street: data.street,
      postal_code: data.postalCode,
      city: data.city,
      country: data.country,
    })
    .eq("id", userData.user.id)

  revalidatePath("/compte")
  return { success: true }
}

/**
 * Met à jour le mot de passe
 */
export async function updateUserPassword(newPassword: string): Promise<ActionResult> {
  const supabase = await createClient()

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Met à jour les préférences de notification
 */
export async function updateNotificationPreferences(prefs: {
  emailMarketing: boolean
  emailUpdates: boolean
  smsAlerts: boolean
  smsMarketing: boolean
}): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    data: {
      notification_preferences: {
        email_marketing: prefs.emailMarketing,
        email_updates: prefs.emailUpdates,
        sms_alerts: prefs.smsAlerts,
        sms_marketing: prefs.smsMarketing,
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/compte")
  return { success: true }
}

/**
 * Déconnecte tous les appareils
 */
export async function logoutAllDevices(): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut({ scope: "global" })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/login")
}

/**
 * Convertit un compte client en compte artisan (en attente de validation)
 */
export async function upgradeToArtisan(data: {
  companyName: string
  siret: string
  phone: string
  street: string
  postalCode: string
  city: string
  experience?: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { success: false, error: "Non connecté" }
  }

  // Vérifier que l'utilisateur n'est pas déjà artisan
  const currentRole = userData.user.user_metadata?.role
  if (currentRole === "artisan" || currentRole === "artisan_pending") {
    return { success: false, error: "Vous avez déjà une demande en cours ou êtes déjà artisan" }
  }

  // Vérifier si le SIRET existe déjà
  const { data: existingSiret } = await supabase
    .from("artisans")
    .select("id")
    .eq("siret", data.siret)
    .single()

  if (existingSiret) {
    return { success: false, error: "Ce numéro SIRET est déjà enregistré" }
  }

  // Mettre à jour le rôle de l'utilisateur en "artisan_pending"
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      role: "artisan_pending",
      phone: data.phone,
      street: data.street,
      postal_code: data.postalCode,
      city: data.city,
    },
  })

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Créer l'entrée dans la table artisans
  const { error: insertError } = await supabase.from("artisans").insert({
    user_id: userData.user.id,
    company_name: data.companyName,
    siret: data.siret,
    first_name: userData.user.user_metadata?.first_name || "",
    last_name: userData.user.user_metadata?.last_name || "",
    email: userData.user.email,
    phone: data.phone,
    address_street: data.street,
    address_postal_code: data.postalCode,
    address_city: data.city,
    experience: data.experience || "",
    status: "pending",
    specialty: "serrurerie",
  })

  if (insertError) {
    // Rollback du rôle en cas d'erreur
    await supabase.auth.updateUser({
      data: { role: "client" },
    })
    return { success: false, error: "Erreur lors de la création du profil artisan" }
  }

  revalidatePath("/compte")
  return { success: true }
}

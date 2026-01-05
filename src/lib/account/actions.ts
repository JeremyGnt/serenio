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

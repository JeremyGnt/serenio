"use server"

import { createClient } from "@/lib/supabase/server"
import type { AuthResult } from "@/types/auth"

interface ArtisanRegisterPayload {
  companyName: string
  siret: string
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  postalCode: string
  city: string
  experience?: string
  password: string
}

/**
 * Inscription d'un artisan (compte en attente de validation)
 */
export async function registerArtisan(payload: ArtisanRegisterPayload): Promise<AuthResult> {
  const supabase = await createClient()

  // Créer le compte auth (mais avec role "artisan_pending")
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        full_name: `${payload.firstName} ${payload.lastName}`,
        phone: payload.phone,
        role: "artisan_pending", // En attente de validation
        is_artisan: true,
      },
    },
  })

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "Cette adresse email est déjà utilisée" }
    }
    return { success: false, error: error.message }
  }

  if (!data.user) {
    return { success: false, error: "Erreur lors de la création du compte" }
  }

  // Créer l'entrée dans la table artisans
  const { error: artisanError } = await supabase.from("artisans").insert({
    id: data.user.id,
    email: payload.email,
    company_name: payload.companyName,
    siret: payload.siret,
    first_name: payload.firstName,
    last_name: payload.lastName,
    phone: payload.phone,
    street: payload.street,
    postal_code: payload.postalCode,
    city: payload.city,
    country: "France",
    experience: payload.experience || null,
    status: "pending", // En attente de validation
    created_at: new Date().toISOString(),
  })

  if (artisanError) {
    console.error("Erreur création artisan:", artisanError)
    // On ne bloque pas si erreur table artisans
  }

  // Déconnecter l'utilisateur (il ne peut pas accéder tant que non validé)
  await supabase.auth.signOut()

  return { success: true }
}

/**
 * Connexion artisan (vérifie si validé)
 */
export async function loginArtisan(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { success: false, error: "Email ou mot de passe incorrect" }
    }
    return { success: false, error: error.message }
  }

  // Vérifier si l'artisan est validé
  const role = data.user?.user_metadata?.role

  if (role === "artisan_pending") {
    await supabase.auth.signOut()
    return {
      success: false,
      error: "Votre compte est en attente de validation. Vous recevrez un email une fois validé.",
    }
  }

  if (role === "artisan_rejected") {
    await supabase.auth.signOut()
    return {
      success: false,
      error: "Votre demande d'inscription a été refusée. Contactez-nous pour plus d'informations.",
    }
  }

  return { success: true, redirectTo: "/pro/urgences" }
}


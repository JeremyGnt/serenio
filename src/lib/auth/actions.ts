"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import type { AuthResult, SignupPayload, LoginPayload } from "@/types/auth"

/**
 * Connexion/Inscription via Google (clients uniquement)
 */
export async function loginWithGoogle(): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { url: data.url }
}

/**
 * Inscription simplifiée (email + mot de passe)
 */
export async function simpleSignup(payload: {
  email: string
  password: string
}): Promise<AuthResult> {
  const supabase = await createClient()

  if (!payload.email) {
    return { success: false, error: "Email requis" }
  }

  if (payload.password.length < 6) {
    return { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" }
  }

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        role: "client",
      },
    },
  })

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "Cette adresse email est déjà utilisée" }
    }
    return { success: false, error: error.message }
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: payload.email,
      role: "client",
      created_at: new Date().toISOString(),
    })
  }

  revalidatePath("/", "layout")
  return { success: true, redirectTo: "/" }
}

/**
 * Inscription complète d'un nouvel utilisateur (client uniquement)
 */
export async function signup(payload: SignupPayload): Promise<AuthResult> {
  const supabase = await createClient()

  // Seuls email, password, firstName, lastName et phone sont obligatoires
  if (
    !payload.email ||
    !payload.password ||
    !payload.firstName ||
    !payload.lastName ||
    !payload.phone
  ) {
    return { success: false, error: "Tous les champs obligatoires doivent être remplis" }
  }

  if (payload.password.length < 6) {
    return { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" }
  }

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        full_name: `${payload.firstName} ${payload.lastName}`,
        phone: payload.phone,
        street: payload.street,
        postal_code: payload.postalCode,
        city: payload.city,
        country: payload.country,
        role: "client",
      },
    },
  })

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "Cette adresse email est déjà utilisée" }
    }
    return { success: false, error: error.message }
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone,
      street: payload.street,
      postal_code: payload.postalCode,
      city: payload.city,
      country: payload.country,
      role: "client",
      created_at: new Date().toISOString(),
    })
  }

  revalidatePath("/", "layout")
  return { success: true, redirectTo: "/" }
}

/**
 * Connexion d'un utilisateur (client OU artisan)
 * Vérifie le rôle et le statut
 */
export async function login(payload: LoginPayload): Promise<AuthResult> {
  const supabase = await createClient()

  if (!payload.email || !payload.password) {
    return { success: false, error: "Email et mot de passe requis" }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  })

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { success: false, error: "Email ou mot de passe incorrect" }
    }
    if (error.message.includes("Email not confirmed")) {
      return { success: false, error: "Veuillez confirmer votre email avant de vous connecter" }
    }
    return { success: false, error: error.message }
  }

  // Vérifier si c'est un artisan
  const role = data.user?.user_metadata?.role
  const isArtisan = data.user?.user_metadata?.is_artisan

  if (isArtisan || role === "artisan_pending" || role === "artisan") {
    // Vérifier le statut de l'artisan
    if (role === "artisan_pending") {
      await supabase.auth.signOut()
      return {
        success: false,
        error: "Votre compte artisan est en attente de validation. Vous recevrez un email une fois validé.",
      }
    }

    if (role === "artisan_rejected") {
      await supabase.auth.signOut()
      return {
        success: false,
        error: "Votre demande d'inscription a été refusée. Contactez-nous pour plus d'informations.",
      }
    }

    // Artisan validé → rediriger vers dashboard pro
    revalidatePath("/", "layout")
    return { success: true, redirectTo: "/pro" }
  }

  // Client normal
  revalidatePath("/", "layout")
  return { success: true, redirectTo: "/" }
}

/**
 * Déconnexion de l'utilisateur
 */
export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

/**
 * Demande de réinitialisation de mot de passe
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = await createClient()

  if (!email) {
    return { success: false, error: "Email requis" }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Mise à jour du mot de passe (après reset)
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = await createClient()

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/", "layout")
  return { success: true, redirectTo: "/" }
}

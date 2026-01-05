// Types pour l'authentification

import type { User } from "@supabase/supabase-js"

/** Résultat d'une action d'authentification */
export interface AuthResult {
  success: boolean
  error?: string
  redirectTo?: string
}

/** Payload pour l'inscription */
export interface SignupPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  street: string
  postalCode: string
  city: string
  country: string
}

/** Payload pour la connexion */
export interface LoginPayload {
  email: string
  password: string
}

/** Profil utilisateur enrichi */
export interface UserProfile {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  street: string | null
  postalCode: string | null
  city: string | null
  country: string | null
  avatarUrl: string | null
  role: "client" | "artisan" | "admin"
  createdAt: string
}

/** Type utilisateur Supabase réexporté pour facilité */
export type { User }

"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type ArtisanStatus = "pending" | "approved" | "rejected" | "suspended" | null

/**
 * Get artisan status from database (source of truth)
 * Returns null if user is not an artisan
 */
export async function getArtisanStatus(userId: string): Promise<ArtisanStatus> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("artisans")
    .select("status")
    .eq("id", userId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data.status as ArtisanStatus
}

/**
 * Check if user is an approved artisan
 * Used in server components and API routes
 */
export async function isApprovedArtisan(userId: string): Promise<boolean> {
  const status = await getArtisanStatus(userId)
  return status === "approved"
}

/**
 * Require approved artisan status or redirect
 * Use in server components that require approved artisan access
 */
export async function requireApprovedArtisan(userId: string): Promise<void> {
  const status = await getArtisanStatus(userId)
  
  if (!status) {
    redirect("/compte")
  }
  
  if (status === "pending") {
    redirect("/artisan-en-attente")
  }
  
  if (status === "rejected") {
    redirect("/artisan-refuse")
  }
  
  if (status === "suspended") {
    redirect("/artisan-suspendu")
  }
  
  if (status !== "approved") {
    redirect("/compte")
  }
}

/**
 * Get full artisan record with status
 * Returns null if not found
 */
export async function getArtisanRecord(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("artisans")
    .select("*")
    .eq("id", userId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data
}

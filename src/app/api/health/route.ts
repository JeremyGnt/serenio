import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET() {
  const { data, error } = await supabase.from("jobs").select("id").limit(1)
  return NextResponse.json({ ok: true, error: error?.message ?? null, data })
}

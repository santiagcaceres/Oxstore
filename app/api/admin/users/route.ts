import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[v0] GET /api/admin/users - Starting request")
    const supabase = await createClient()

    console.log("[v0] Supabase client created successfully")

    const {
      data: profiles,
      error,
      status,
      statusText,
    } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

    console.log("[v0] Query executed - Status:", status, statusText)
    console.log("[v0] Query error:", error)
    console.log("[v0] Query data:", profiles)

    if (error) {
      console.error("[v0] Error loading profiles:", error)
      return NextResponse.json({ error: "Error al cargar usuarios: " + error.message }, { status: 500 })
    }

    console.log(`[v0] Loaded ${profiles?.length || 0} profiles from user_profiles`)

    if (!profiles || profiles.length === 0) {
      console.log("[v0] No profiles found in user_profiles table")
      return NextResponse.json({ users: [] })
    }

    const profilesWithEmails = await Promise.all(
      profiles.map(async (profile) => {
        try {
          console.log(`[v0] Getting email for profile ID: ${profile.id}`)

          // Get user from auth.users using the profile ID
          const { data: authData, error: authError } = await supabase.auth.admin.getUserById(profile.id)

          if (authError) {
            console.error(`[v0] Error getting auth user for profile ${profile.id}:`, authError)
            return {
              ...profile,
              email: "Sin email",
            }
          }

          console.log(`[v0] Got email for profile ${profile.id}: ${authData.user?.email}`)

          return {
            ...profile,
            email: authData.user?.email || "Sin email",
          }
        } catch (error) {
          console.error(`[v0] Exception getting email for profile ${profile.id}:`, error)
          return {
            ...profile,
            email: "Sin email",
          }
        }
      }),
    )

    console.log(`[v0] Returning ${profilesWithEmails.length} users with emails`)
    return NextResponse.json({ users: profilesWithEmails })
  } catch (error) {
    console.error("[v0] Error in GET /api/admin/users:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

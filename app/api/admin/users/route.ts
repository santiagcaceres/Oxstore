import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[v0] GET /api/admin/users - Starting request")
    const supabase = createClient()

    console.log("[v0] Supabase client created successfully")

    const {
      data: { users: authUsers },
      error: authError,
    } = await supabase.auth.admin.listUsers()

    console.log("[v0] Auth users query executed")
    console.log("[v0] Auth users error:", authError)
    console.log("[v0] Auth users count:", authUsers?.length || 0)

    if (authError) {
      console.error("[v0] Error loading auth users:", authError)
      return NextResponse.json({ error: "Error al cargar usuarios: " + authError.message }, { status: 500 })
    }

    if (!authUsers || authUsers.length === 0) {
      console.log("[v0] No users found in auth.users table")
      return NextResponse.json({ users: [] })
    }

    console.log("[v0] Found auth users, getting profiles from user_profiles")

    const usersWithProfiles = await Promise.all(
      authUsers.map(async (authUser) => {
        try {
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", authUser.id)
            .single()

          if (profileError || !profile) {
            console.log(`[v0] No profile found for user ${authUser.id}`)
            return {
              id: authUser.id,
              email: authUser.email || "Sin email",
              first_name: null,
              last_name: null,
              phone: null,
              address: null,
              city: null,
              province: null,
              postal_code: null,
              dni: null,
              created_at: authUser.created_at,
              is_verified: authUser.email_confirmed_at !== null,
              verified_at: authUser.email_confirmed_at,
            }
          }

          return {
            ...profile,
            email: authUser.email || "Sin email",
          }
        } catch (error) {
          console.error(`[v0] Exception getting profile for user ${authUser.id}:`, error)
          return {
            id: authUser.id,
            email: authUser.email || "Sin email",
            first_name: null,
            last_name: null,
            phone: null,
            address: null,
            city: null,
            province: null,
            postal_code: null,
            dni: null,
            created_at: authUser.created_at,
            is_verified: authUser.email_confirmed_at !== null,
            verified_at: authUser.email_confirmed_at,
          }
        }
      }),
    )

    console.log(`[v0] Returning ${usersWithProfiles.length} users with profiles`)
    return NextResponse.json({ users: usersWithProfiles })
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

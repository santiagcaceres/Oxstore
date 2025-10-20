import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] DELETE /api/admin/users/[id] - Starting request for user:", params.id)

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { id } = params

    console.log("[v0] Attempting to delete auth user...")
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      console.warn("[v0] Could not delete auth user (may not exist in auth.users):", authError.message)
      // Don't return error - continue to delete profile
    } else {
      console.log("[v0] Auth user deleted successfully")
    }

    console.log("[v0] Attempting to delete user profile...")
    const { error: profileError } = await supabase.from("user_profiles").delete().eq("id", id)

    if (profileError) {
      console.error("[v0] Error deleting user profile:", profileError)
      return NextResponse.json({ error: "Error al eliminar perfil de usuario" }, { status: 500 })
    }

    console.log("[v0] User profile deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/admin/users/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

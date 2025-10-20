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

    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      console.error("[v0] Error deleting auth user:", authError)
      return NextResponse.json({ error: "Error al eliminar usuario de autenticación" }, { status: 500 })
    }

    console.log("[v0] Auth user deleted successfully")

    const { error: profileError } = await supabase.from("user_profiles").delete().eq("id", id)

    if (profileError) {
      console.error("[v0] Error deleting user profile:", profileError)
      // Auth user is already deleted, so we log but don't fail
      console.warn("[v0] Auth user deleted but profile deletion failed")
    } else {
      console.log("[v0] User profile deleted successfully")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/admin/users/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

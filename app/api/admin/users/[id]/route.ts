import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] DELETE /api/admin/users/[id] - Starting request for user:", params.id)
    const supabase = await createClient()
    const { id } = params

    const { error: profileError } = await supabase.from("user_profiles").delete().eq("id", id)

    if (profileError) {
      console.error("[v0] Error deleting user profile:", profileError)
      return NextResponse.json({ error: "Error al eliminar perfil de usuario" }, { status: 500 })
    }

    console.log("[v0] User profile deleted successfully")

    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      console.error("[v0] Error deleting auth user:", authError)
      // Profile is already deleted, so we return success but log the auth error
      console.warn("[v0] Profile deleted but auth user deletion failed")
    } else {
      console.log("[v0] Auth user deleted successfully")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/admin/users/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

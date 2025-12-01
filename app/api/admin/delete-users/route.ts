import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Este endpoint requiere usar el Supabase Service Role Key
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST() {
  try {
    console.log("[v0] Starting user deletion process...")

    // Obtener todos los usuarios
    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error("[v0] Error listing users:", listError)
      return NextResponse.json({ error: "Error al listar usuarios" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No hay usuarios para eliminar", deleted: 0 })
    }

    // Filtrar usuarios que NO son admin
    const usersToDelete = users.filter(
      (user) => user.email !== "admin@oxstore.com" && !user.email?.includes("admin") && !user.email?.includes("test"),
    )

    console.log(`[v0] Found ${usersToDelete.length} users to delete`)

    let deletedCount = 0
    const errors: string[] = []

    // Eliminar cada usuario
    for (const user of usersToDelete) {
      try {
        // Primero eliminar el perfil
        const { error: profileError } = await supabaseAdmin.from("user_profiles").delete().eq("id", user.id)

        if (profileError) {
          console.error(`[v0] Error deleting profile for ${user.email}:`, profileError)
          errors.push(`Error eliminando perfil de ${user.email}`)
        }

        // Luego eliminar el usuario de auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (authError) {
          console.error(`[v0] Error deleting auth user ${user.email}:`, authError)
          errors.push(`Error eliminando usuario ${user.email}`)
        } else {
          deletedCount++
          console.log(`[v0] Deleted user: ${user.email}`)
        }
      } catch (error) {
        console.error(`[v0] Exception deleting user ${user.email}:`, error)
        errors.push(`Excepción al eliminar ${user.email}`)
      }
    }

    return NextResponse.json({
      message: `Eliminación completada`,
      deleted: deletedCount,
      total: usersToDelete.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("[v0] Error in delete users endpoint:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

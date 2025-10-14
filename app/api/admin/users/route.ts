import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: profiles, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading profiles:", error)
      return NextResponse.json({ error: "Error al cargar usuarios" }, { status: 500 })
    }

    return NextResponse.json({ users: profiles || [] })
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

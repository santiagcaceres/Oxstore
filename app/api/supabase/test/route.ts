import { NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Supabase no está configurado. Faltan variables de entorno.",
      })
    }

    // Probar conexión básica
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Error de conexión: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Conexión exitosa con Supabase",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error testing Supabase:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

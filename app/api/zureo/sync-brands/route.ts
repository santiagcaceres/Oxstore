import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("[v0] Sincronización de marcas deshabilitada - usando marcas fijas")

    const supabase = await createClient()

    // Verificar que las marcas fijas estén en la base de datos
    const { data: existingBrands, error } = await supabase.from("brands").select("id, name").order("name")

    if (error) {
      throw new Error(`Error verificando marcas: ${error.message}`)
    }

    const brandCount = existingBrands?.length || 0
    console.log(`[v0] ${brandCount} marcas fijas encontradas en la base de datos`)

    // Actualizar sync_status para indicar que las marcas están fijas
    await supabase.from("sync_status").upsert(
      {
        sync_type: "brands_fixed",
        status: "completed",
        total_records: brandCount,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "sync_type",
      },
    )

    return NextResponse.json({
      success: true,
      message: "Las marcas son fijas y no se sincronizan desde Zureo",
      totalBrands: brandCount,
      timestamp: new Date().toISOString(),
      brands: existingBrands?.slice(0, 10) || [], // Mostrar las primeras 10 marcas
    })
  } catch (error) {
    console.error("[v0] Error verificando marcas fijas:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("[v0] Brand synchronization from ZUREO is disabled")

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Solo devolver las marcas existentes en la base de datos
    const { data: brands } = await supabase.from("brands").select("*").order("name", { ascending: true })

    return Response.json({
      success: true,
      fromCache: true,
      lastSync: "disabled",
      brands: brands || [],
      summary: {
        totalBrands: brands?.length || 0,
        message: "Marcas fijas - sincronización con ZUREO deshabilitada",
      },
    })
  } catch (error) {
    console.error("[v0] Brands sync error:", error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

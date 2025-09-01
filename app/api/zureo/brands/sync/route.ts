import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("[v0] Starting automatic brands sync")

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verificar última sincronización
    const { data: syncStatus } = await supabase.from("sync_status").select("*").eq("sync_type", "brands").single()

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Si hay sincronización reciente (menos de 24 horas), devolver marcas existentes
    if (syncStatus && new Date(syncStatus.last_sync_at) > twentyFourHoursAgo) {
      console.log("[v0] Using cached brands (sync within 24 hours)")

      const { data: brands } = await supabase.from("brands").select("*").order("name", { ascending: true })

      return Response.json({
        success: true,
        fromCache: true,
        lastSync: syncStatus.last_sync_at,
        brands: brands || [],
        summary: {
          totalBrands: brands?.length || 0,
          message: "Marcas cargadas desde cache (sincronización diaria)",
        },
      })
    }

    console.log("[v0] Cache expired or not found, fetching from Zureo API")

    // Configuración de API
    const apiUrl = process.env.ZUREO_API_URL || "https://api.zureo.com"
    const username = process.env.ZUREO_USERNAME
    const password = process.env.ZUREO_PASSWORD
    const domain = process.env.ZUREO_DOMAIN
    const companyId = process.env.ZUREO_COMPANY_ID || "1"

    if (!username || !password || !domain) {
      return Response.json({
        success: false,
        error: "Missing environment variables",
      })
    }

    // Paso 1: Autenticación
    const credentials = `${username}:${password}:${domain}`
    const encodedCredentials = Buffer.from(credentials).toString("base64")

    const authUrl = `${apiUrl}/sdk/v1/security/login`
    const authResponse = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
    })

    const authData = await authResponse.json()
    console.log("[v0] Auth completed:", authResponse.ok)

    if (!authResponse.ok) {
      return Response.json({
        success: false,
        error: "Authentication failed",
        details: authData,
      })
    }

    // Paso 2: Obtener todas las marcas
    const token = authData.token
    const brandsUrl = `${apiUrl}/sdk/v1/brand/all?emp=${companyId}`

    console.log("[v0] Fetching brands from Zureo API")

    const brandsResponse = await fetch(brandsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!brandsResponse.ok) {
      const errorData = await brandsResponse.json().catch(() => ({}))
      console.error("[v0] Brands request failed:", brandsResponse.status, errorData)

      if (brandsResponse.status === 429) {
        return Response.json({
          success: false,
          error: "Rate limit exceeded",
          details: errorData,
        })
      }

      return Response.json({
        success: false,
        error: "Failed to fetch brands",
        details: errorData,
      })
    }

    const brandsData = await brandsResponse.json()
    const brands = brandsData.data || []

    console.log(`[v0] Received ${brands.length} brands`)

    // Paso 3: Limpiar marcas existentes y guardar nuevas
    await supabase.from("brands").delete().neq("id", 0)

    // Convertir y guardar marcas
    const internalBrands = brands
      .filter((brand: any) => brand.nombre && brand.nombre.trim()) // Filtrar marcas sin nombre
      .map((brand: any) => ({
        zureo_id: brand.id,
        name: brand.nombre.trim(),
        slug: brand.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

    let insertedCount = 0

    if (internalBrands.length > 0) {
      const { error } = await supabase.from("brands").insert(internalBrands)

      if (error) {
        console.error("[v0] Error inserting brands:", error)
        return Response.json({
          success: false,
          error: "Failed to insert brands",
          details: error,
        })
      } else {
        insertedCount = internalBrands.length
        console.log(`[v0] Inserted ${insertedCount} brands`)
      }
    }

    // Actualizar estado de sincronización
    const syncTime = new Date().toISOString()
    await supabase.from("sync_status").upsert({
      sync_type: "brands",
      last_sync_at: syncTime,
      total_records: insertedCount,
      status: "completed",
      created_at: syncTime,
      updated_at: syncTime,
    })

    return Response.json({
      success: true,
      fromCache: false,
      summary: {
        totalFetched: brands.length,
        totalInserted: insertedCount,
        syncTime: syncTime,
        message: "Marcas sincronizadas exitosamente desde Zureo API",
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

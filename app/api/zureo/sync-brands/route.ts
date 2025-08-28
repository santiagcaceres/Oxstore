import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] Iniciando sincronización de marcas")

    // Paso 1: Obtener token
    console.log("[v0] Paso 1: Obteniendo token de autenticación")

    const username = process.env.ZUREO_USERNAME
    const password = process.env.ZUREO_PASSWORD
    const domain = process.env.ZUREO_DOMAIN
    const baseUrl = process.env.ZUREO_API_URL || "https://api.zureo.com"

    if (!username || !password || !domain) {
      throw new Error("Variables de entorno de Zureo no configuradas")
    }

    // Crear credenciales Basic Auth
    const credentials = Buffer.from(`${username}:${password}:${domain}`).toString("base64")

    const authResponse = await fetch(`${baseUrl}/sdk/v1/security/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      throw new Error(`Error de autenticación: ${authResponse.status} - ${errorText}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    if (!token) {
      throw new Error("No se recibió token de autenticación")
    }

    console.log("[v0] Token obtenido exitosamente")

    // Paso 2: Obtener marcas
    console.log("[v0] Paso 2: Obteniendo marcas desde Zureo")

    const brandsResponse = await fetch(`${baseUrl}/sdk/v1/brand/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!brandsResponse.ok) {
      const errorText = await brandsResponse.text()
      throw new Error(`Error al obtener marcas: ${brandsResponse.status} - ${errorText}`)
    }

    const brandsData = await brandsResponse.json()
    const brands = brandsData.data || []

    console.log(`[v0] ${brands.length} marcas obtenidas desde Zureo`)

    // Paso 3: Guardar en base de datos (simulado por ahora)
    let savedBrands = 0
    for (const brand of brands) {
      // Aquí iría la lógica para guardar en Supabase
      // Por ahora solo contamos
      savedBrands++
    }

    console.log(`[v0] ${savedBrands} marcas procesadas`)

    return NextResponse.json({
      success: true,
      totalBrands: brands.length,
      savedBrands,
      timestamp: new Date().toISOString(),
      endpoint: `${baseUrl}/sdk/v1/brand/all`,
      brands: brands.slice(0, 5), // Solo las primeras 5 para no saturar la respuesta
    })
  } catch (error) {
    console.error("[v0] Error en sincronización de marcas:", error)

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

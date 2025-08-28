import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] Iniciando sincronización de productos")

    // Paso 1: Obtener token
    console.log("[v0] Paso 1: Obteniendo token de autenticación")

    const username = process.env.ZUREO_USERNAME
    const password = process.env.ZUREO_PASSWORD
    const domain = process.env.ZUREO_DOMAIN
    const companyId = process.env.ZUREO_COMPANY_ID || "1"
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

    // Paso 2: Obtener productos con paginación
    console.log("[v0] Paso 2: Obteniendo productos desde Zureo")

    let allProducts: any[] = []
    let offset = 0
    const limit = 1000
    let requests = 0

    while (true) {
      console.log(`[v0] Obteniendo productos desde ${offset} hasta ${offset + limit}`)

      const productsResponse = await fetch(
        `${baseUrl}/sdk/v1/product/all?emp=${companyId}&from=${offset}&qty=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!productsResponse.ok) {
        const errorText = await productsResponse.text()
        throw new Error(`Error al obtener productos: ${productsResponse.status} - ${errorText}`)
      }

      const productsData = await productsResponse.json()
      const products = productsData.data || []

      requests++
      allProducts = allProducts.concat(products)

      console.log(`[v0] Obtenidos ${products.length} productos en esta página`)

      // Si obtuvimos menos productos que el límite, hemos llegado al final
      if (products.length < limit) {
        break
      }

      offset += limit

      // Delay para respetar rate limiting
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    console.log(`[v0] Total de productos obtenidos: ${allProducts.length}`)

    // Paso 3: Guardar en base de datos (simulado por ahora)
    let savedProducts = 0
    for (const product of allProducts) {
      // Aquí iría la lógica para guardar en Supabase
      // Por ahora solo contamos
      savedProducts++
    }

    console.log(`[v0] ${savedProducts} productos procesados`)

    return NextResponse.json({
      success: true,
      totalProducts: allProducts.length,
      savedProducts,
      requests,
      timestamp: new Date().toISOString(),
      endpoint: `${baseUrl}/sdk/v1/product/all`,
      sampleProducts: allProducts.slice(0, 3), // Solo los primeros 3 para no saturar la respuesta
    })
  } catch (error) {
    console.error("[v0] Error en sincronización de productos:", error)

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

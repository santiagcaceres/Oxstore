import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("[v0] Starting automatic products sync")

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verificar última sincronización
    const { data: syncStatus } = await supabase.from("sync_status").select("*").eq("type", "products").single()

    const now = new Date()
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)

    // Si hay sincronización reciente (menos de 12 horas), devolver productos existentes
    if (syncStatus && new Date(syncStatus.last_sync) > twelveHoursAgo) {
      console.log("[v0] Using cached products (sync within 12 hours)")

      const { data: products } = await supabase
        .from("products")
        .select("*")
        .gt("stock_quantity", 0)
        .order("created_at", { ascending: false })

      return Response.json({
        success: true,
        fromCache: true,
        lastSync: syncStatus.last_sync,
        products: products || [],
        summary: {
          totalProducts: products?.length || 0,
          message: "Productos cargados desde cache (sincronización reciente)",
        },
      })
    }

    console.log("[v0] Cache expired or not found, fetching from Zureo API")

    // Paso 1: Obtener token
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

    // Autenticación
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

    // Paso 2: Obtener todos los productos con paginación
    const token = authData.token
    const allProducts = []
    let offset = 0
    const limit = 1000

    while (true) {
      const productsUrl = `${apiUrl}/sdk/v1/product/all?emp=${companyId}&from=${offset}&qty=${limit}`

      console.log(`[v0] Fetching products from offset ${offset}`)

      const productsResponse = await fetch(productsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!productsResponse.ok) {
        console.error("[v0] Products request failed:", productsResponse.status)
        break
      }

      const productsData = await productsResponse.json()
      const products = productsData.data || []

      console.log(`[v0] Received ${products.length} products`)

      if (products.length === 0) {
        break
      }

      allProducts.push(...products)

      if (products.length < limit) {
        break
      }

      offset += limit

      // Rate limiting delay
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    console.log(`[v0] Total products fetched: ${allProducts.length}`)

    // Paso 3: Filtrar solo productos con stock > 0
    const productsWithStock = allProducts.filter((product) => {
      const hasStock = product.stock > 0
      const hasVarietyStock = product.variedades && product.variedades.some((v: any) => v.stock > 0)
      return hasStock || hasVarietyStock
    })

    console.log(`[v0] Products with stock: ${productsWithStock.length}`)

    // Paso 4: Limpiar productos existentes y guardar nuevos
    await supabase.from("products").delete().neq("id", 0)

    // Convertir y guardar productos con stock
    const internalProducts = productsWithStock
      .filter((product) => !product.baja) // Filtrar productos dados de baja
      .map((product) => ({
        zureo_id: product.id,
        zureo_code: product.codigo || `ZUR-${product.id}`,
        name: product.nombre || "Sin nombre",
        slug: (product.nombre || "producto").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: product.descripcion_larga || product.descripcion_corta || "",
        price: product.precio || 0,
        stock_quantity: product.stock || 0,
        category: product.tipo?.nombre || "Sin categoría",
        brand: product.marca?.nombre || "Sin marca",
        image_url: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.nombre || "producto")}`,
        is_featured: false,
        discount_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

    // Insertar en lotes de 100
    const batchSize = 100
    let insertedCount = 0

    for (let i = 0; i < internalProducts.length; i += batchSize) {
      const batch = internalProducts.slice(i, i + batchSize)
      const { error } = await supabase.from("products").insert(batch)

      if (error) {
        console.error(`[v0] Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        insertedCount += batch.length
        console.log(`[v0] Inserted batch ${i / batchSize + 1}: ${batch.length} products`)
      }
    }

    const syncTime = new Date().toISOString()
    await supabase.from("sync_status").upsert({
      type: "products",
      last_sync: syncTime,
      total_records: insertedCount,
      status: "completed",
    })

    return Response.json({
      success: true,
      fromCache: false,
      summary: {
        totalFetched: allProducts.length,
        totalWithStock: productsWithStock.length,
        totalInserted: insertedCount,
        syncTime: syncTime,
        categories: [...new Set(productsWithStock.map((p) => p.tipo?.nombre).filter(Boolean))],
        brands: [...new Set(productsWithStock.map((p) => p.marca?.nombre).filter(Boolean))],
      },
    })
  } catch (error) {
    console.error("[v0] Sync error:", error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

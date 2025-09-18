import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("[v0] Starting automatic products sync")

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verificar última sincronización
    const { data: syncStatus } = await supabase.from("sync_status").select("*").eq("sync_type", "products").single()

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Si hay sincronización reciente (menos de 24 horas), devolver productos existentes
    if (syncStatus && new Date(syncStatus.last_sync_at) > twentyFourHoursAgo) {
      console.log("[v0] Using cached products (sync within 24 hours)")

      const { data: products } = await supabase
        .from("products_in_stock")
        .select("*")
        .gt("stock_quantity", 0)
        .order("created_at", { ascending: false })

      return Response.json({
        success: true,
        fromCache: true,
        lastSync: syncStatus.last_sync_at,
        products: products || [],
        summary: {
          totalProducts: products?.length || 0,
          message: "Productos cargados desde cache (sincronización diaria)",
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
    let requestCount = 0

    while (true) {
      const productsUrl = `${apiUrl}/sdk/v1/product/all?emp=${companyId}&from=${offset}&qty=${limit}`

      console.log(`[v0] Fetching products from offset ${offset} (request ${requestCount + 1})`)

      const productsResponse = await fetch(productsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!productsResponse.ok) {
        const errorData = await productsResponse.json().catch(() => ({}))
        console.error("[v0] Products request failed:", productsResponse.status, errorData)

        if (productsResponse.status === 429) {
          console.log("[v0] Rate limit exceeded, waiting 60 seconds before retry...")
          await new Promise((resolve) => setTimeout(resolve, 60000)) // Esperar 60 segundos
          continue // Reintentar la misma request
        }

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
      requestCount++

      if (requestCount % 8 === 0) {
        console.log(`[v0] Completed ${requestCount} requests, waiting 45 seconds to respect rate limits...`)
        await new Promise((resolve) => setTimeout(resolve, 45000)) // Esperar 45 segundos cada 8 requests
      } else {
        await new Promise((resolve) => setTimeout(resolve, 4000)) // 4 segundos entre requests
      }
    }

    console.log(`[v0] Total products fetched: ${allProducts.length}`)

    // Paso 3: Filtrar solo productos con stock > 0
    const productsWithStock = allProducts.filter((product) => {
      // Verificar stock del producto principal
      const hasMainStock = product.stock > 0

      // Verificar stock en variedades
      const hasVarietyStock =
        product.variedades &&
        Array.isArray(product.variedades) &&
        product.variedades.some((variety: any) => variety.stock > 0)

      return hasMainStock || hasVarietyStock
    })

    console.log(`[v0] Products with stock: ${productsWithStock.length}`)

    // Paso 4: Limpiar productos existentes y guardar nuevos
    await supabase.from("products_in_stock").delete().neq("id", 0)
    await supabase.from("product_variants").delete().neq("id", 0)

    // Convertir y guardar productos con stock
    const internalProducts = productsWithStock
      .filter((product) => !product.baja) // Filtrar productos dados de baja
      .map((product) => {
        // Calcular stock total (producto + variedades)
        const mainStock = product.stock || 0
        const varietyStock =
          product.variedades?.reduce((total: number, variety: any) => total + (variety.stock || 0), 0) || 0
        const totalStock = Math.max(mainStock, varietyStock)

        // Obtener precio más actualizado
        const latestPrice =
          product.variedades && product.variedades.length > 0
            ? product.variedades[0].precio || product.precio
            : product.precio

        return {
          zureo_id: product.id,
          zureo_code: product.codigo || `ZUR-${product.id}`,
          name: product.nombre || "Sin nombre",
          slug: (product.nombre || "producto").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: product.descripcionLarga || product.descripcionCorta || "",
          price: latestPrice || 0,
          stock_quantity: totalStock,
          category: product.tipo?.nombre || "Sin categoría",
          brand: product.marca?.nombre || "Sin marca",
          image_url: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.nombre || "producto")}`,
          is_featured: false,
          discount_percentage: 0,
          zureo_data: JSON.stringify({
            originalProduct: product,
            varieties: product.variedades || [],
            lastUpdated: new Date().toISOString(),
          }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })

    // Insertar productos en lotes de 100
    const batchSize = 100
    let insertedCount = 0
    const insertedProducts = []

    for (let i = 0; i < internalProducts.length; i += batchSize) {
      const batch = internalProducts.slice(i, i + batchSize)
      const { data: insertedBatch, error } = await supabase.from("products_in_stock").insert(batch).select()

      if (error) {
        console.error(`[v0] Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        insertedCount += batch.length
        insertedProducts.push(...(insertedBatch || []))
        console.log(`[v0] Inserted batch ${i / batchSize + 1}: ${batch.length} products`)
      }
    }

    console.log(`[v0] Creating variants for ${insertedProducts.length} products`)
    let totalVariantsCreated = 0

    for (const insertedProduct of insertedProducts) {
      try {
        const zureoData = JSON.parse(insertedProduct.zureo_data)
        const varieties = zureoData.varieties || []

        if (varieties.length > 0) {
          // Crear variantes basadas en las variedades de Zureo
          const variants = varieties
            .filter((variety: any) => variety.stock > 0) // Solo variantes con stock
            .map((variety: any) => {
              // Extraer color y talle de los atributos
              let color = null
              let size = null

              if (variety.atributos && Array.isArray(variety.atributos)) {
                for (const attr of variety.atributos) {
                  if (attr.atributo === "Color") {
                    color = attr.valor
                  } else if (attr.atributo === "Talle") {
                    size = attr.valor
                  }
                }
              }

              return {
                product_id: insertedProduct.id,
                zureo_variety_id: variety.id,
                color: color,
                size: size,
                stock_quantity: variety.stock || 0,
                price: variety.precio || insertedProduct.price,
                variety_name: variety.nombre || `${color || ""} ${size || ""}`.trim(),
                variety_data: JSON.stringify(variety),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            })

          if (variants.length > 0) {
            const { error: variantError } = await supabase.from("product_variants").insert(variants)

            if (variantError) {
              console.error(`[v0] Error inserting variants for product ${insertedProduct.id}:`, variantError)
            } else {
              totalVariantsCreated += variants.length
              console.log(`[v0] Created ${variants.length} variants for product: ${insertedProduct.name}`)
            }
          }
        } else {
          // Si no hay variedades, crear una variante básica
          const basicVariant = {
            product_id: insertedProduct.id,
            zureo_variety_id: null,
            color: null,
            size: null,
            stock_quantity: insertedProduct.stock_quantity,
            price: insertedProduct.price,
            variety_name: "Estándar",
            variety_data: JSON.stringify({ isBasic: true }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { error: variantError } = await supabase.from("product_variants").insert([basicVariant])

          if (variantError) {
            console.error(`[v0] Error inserting basic variant for product ${insertedProduct.id}:`, variantError)
          } else {
            totalVariantsCreated += 1
          }
        }
      } catch (error) {
        console.error(`[v0] Error processing variants for product ${insertedProduct.id}:`, error)
      }
    }

    console.log(`[v0] Total variants created: ${totalVariantsCreated}`)

    const syncTime = new Date().toISOString()
    await supabase.from("sync_status").upsert({
      sync_type: "products",
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
        totalFetched: allProducts.length,
        totalWithStock: productsWithStock.length,
        totalInserted: insertedCount,
        totalVariantsCreated: totalVariantsCreated,
        syncTime: syncTime,
        categories: [...new Set(productsWithStock.map((p) => p.tipo?.nombre).filter(Boolean))],
        brands: [...new Set(productsWithStock.map((p) => p.marca?.nombre).filter(Boolean))],
        varietiesInfo: {
          totalVarieties: productsWithStock.reduce((total, p) => total + (p.variedades?.length || 0), 0),
          productsWithVarieties: productsWithStock.filter((p) => p.variedades && p.variedades.length > 0).length,
        },
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

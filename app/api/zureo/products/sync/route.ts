import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("[v0] Starting automatic products sync")

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: syncStatus } = await supabase.from("sync_status").select("*").eq("sync_type", "products").single()

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

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
        let errorData
        const contentType = productsResponse.headers.get("content-type")

        if (contentType && contentType.includes("application/json")) {
          errorData = await productsResponse.json().catch(() => ({}))
        } else {
          const errorText = await productsResponse.text()
          errorData = { message: errorText, status: productsResponse.status }
        }

        console.error("[v0] Products request failed:", productsResponse.status, errorData)

        if (productsResponse.status === 429) {
          console.log("[v0] Rate limit exceeded, waiting 60 seconds before retry...")
          await new Promise((resolve) => setTimeout(resolve, 60000))
          continue
        }

        break
      }

      let productsData
      try {
        const contentType = productsResponse.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const responseText = await productsResponse.text()
          console.error("[v0] Response is not JSON:", responseText.substring(0, 200))
          throw new Error(`API returned non-JSON response: ${responseText.substring(0, 100)}`)
        }

        productsData = await productsResponse.json()
      } catch (parseError) {
        console.error("[v0] Failed to parse JSON response:", parseError)
        return Response.json({
          success: false,
          error: "Failed to parse API response",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
        })
      }

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
        await new Promise((resolve) => setTimeout(resolve, 45000))
      } else {
        await new Promise((resolve) => setTimeout(resolve, 4000))
      }
    }

    console.log(`[v0] Total products fetched: ${allProducts.length}`)

    const productsWithStock = allProducts.filter((product) => {
      const hasMainStock = product.stock > 0
      const hasVarietyStock =
        product.variedades &&
        Array.isArray(product.variedades) &&
        product.variedades.some((variety: any) => variety.stock > 0)

      return hasMainStock || hasVarietyStock
    })

    console.log(`[v0] Products with stock: ${productsWithStock.length}`)

    console.log("[v0] Using UPSERT to sync products (no accumulation)...")

    function extractColorAndSize(variety: any): { color: string | null; size: string | null } {
      let color = null
      let size = null

      if (variety.atributos && Array.isArray(variety.atributos)) {
        for (const attr of variety.atributos) {
          const atributoName = (attr.atributo || "").toLowerCase()
          const valor = attr.valor || ""

          if (atributoName.includes("color") || atributoName.includes("colour")) {
            color = valor
          } else if (
            atributoName.includes("talle") ||
            atributoName.includes("size") ||
            atributoName.includes("talla")
          ) {
            size = valor
          }
        }
      }

      if (!color && !size && variety.nombre) {
        const nombre = variety.nombre.toLowerCase()

        const sizePatterns = /\b(xs|s|m|l|xl|xxl|\d+)\b/i
        const sizeMatch = nombre.match(sizePatterns)
        if (sizeMatch) {
          size = sizeMatch[0].toUpperCase()
        }

        const colorPatterns =
          /\b(negro|blanco|azul|rojo|verde|amarillo|rosa|gris|marron|beige|violeta|naranja|celeste|fucsia|dorado|plateado|black|white|blue|red|green|yellow|pink|gray|brown|purple|orange|gold|silver)\b/i
        const colorMatch = nombre.match(colorPatterns)
        if (colorMatch) {
          color = colorMatch[0]
        }
      }

      return { color, size }
    }

    const { data: subcategoriesData } = await supabase
      .from("subcategories")
      .select("id, name, slug, category_id")
      .eq("is_active", true)

    const subcategoriesMap = new Map(subcategoriesData?.map((s) => [s.name.toLowerCase(), s]) || [])
    console.log("[v0] Loaded subcategories for mapping:", subcategoriesMap.size)

    function mapZureoToSubcategory(zureoCategory: string): string | null {
      if (!zureoCategory) return null

      const categoryLower = zureoCategory.toLowerCase().trim()

      if (subcategoriesMap.has(categoryLower)) {
        return subcategoriesMap.get(categoryLower)!.name
      }

      const mappings: { [key: string]: string } = {
        remera: "Remeras",
        remeras: "Remeras",
        camiseta: "Remeras",
        camisetas: "Remeras",
        pantalon: "Pantalones",
        pantalones: "Pantalones",
        jean: "Jeans",
        jeans: "Jeans",
        buzo: "Buzos",
        buzos: "Buzos",
        campera: "Camperas",
        camperas: "Camperas",
        zapatilla: "Zapatillas",
        zapatillas: "Zapatillas",
        zapato: "Zapatos",
        zapatos: "Zapatos",
        short: "Shorts",
        shorts: "Shorts",
        pollera: "Polleras",
        polleras: "Polleras",
        vestido: "Vestidos",
        vestidos: "Vestidos",
        camisa: "Camisas",
        camisas: "Camisas",
        chomba: "Chombas",
        chombas: "Chombas",
        musculosa: "Musculosas",
        musculosas: "Musculosas",
        calza: "Calzas",
        calzas: "Calzas",
        jogger: "Joggers",
        joggers: "Joggers",
        canguro: "Canguros",
        canguros: "Canguros",
        gorra: "Gorras",
        gorras: "Gorras",
        mochila: "Mochilas",
        mochilas: "Mochilas",
        cartera: "Carteras",
        carteras: "Carteras",
        billetera: "Billeteras",
        billeteras: "Billeteras",
        cinturon: "Cinturones",
        cinturones: "Cinturones",
        medias: "Medias",
        media: "Medias",
      }

      return mappings[categoryLower] || null
    }

    console.log("[v0] Grouping products by zureo_code and creating variants...")
    const productsMap = new Map()

    for (const product of productsWithStock.filter((p) => !p.baja)) {
      const impuestoMultiplier = product.impuesto || 1.22
      const basePrice = product.precio || 0
      const brandName = (product.marca?.nombre || "SIN MARCA").toUpperCase()
      const subcategory = mapZureoToSubcategory(product.tipo?.nombre || "")
      const zureoCode = product.codigo || `ZUR-${product.id}`

      // Si el producto ya existe en el mapa, solo agregar las variantes
      if (productsMap.has(zureoCode)) {
        const existingProduct = productsMap.get(zureoCode)

        // Agregar variantes si existen
        if (product.variedades && Array.isArray(product.variedades) && product.variedades.length > 0) {
          for (const variety of product.variedades) {
            if (variety.stock > 0) {
              const { color, size } = extractColorAndSize(variety)
              const varietyPrice = variety.precio || basePrice
              const finalPrice = Math.round(varietyPrice * impuestoMultiplier)

              existingProduct.variants.push({
                zureo_variety_id: variety.id,
                color: color,
                size: size,
                stock_quantity: variety.stock,
                price: finalPrice,
                variety_name: variety.nombre || "",
                variety_data: variety,
              })

              existingProduct.stock_quantity += variety.stock
            }
          }
        }
      } else {
        // Crear nuevo producto
        const finalPrice = Math.round(basePrice * impuestoMultiplier)
        let totalStock = product.stock || 0
        const variants = []

        // Procesar variantes
        if (product.variedades && Array.isArray(product.variedades) && product.variedades.length > 0) {
          for (const variety of product.variedades) {
            if (variety.stock > 0) {
              const { color, size } = extractColorAndSize(variety)
              const varietyPrice = variety.precio || basePrice
              const varietyFinalPrice = Math.round(varietyPrice * impuestoMultiplier)

              variants.push({
                zureo_variety_id: variety.id,
                color: color,
                size: size,
                stock_quantity: variety.stock,
                price: varietyFinalPrice,
                variety_name: variety.nombre || "",
                variety_data: variety,
              })

              totalStock += variety.stock
            }
          }
        }

        productsMap.set(zureoCode, {
          zureo_id: product.id,
          zureo_code: zureoCode,
          name: product.nombre || "Sin nombre",
          slug: (product.nombre || "producto").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: product.descripcion_larga || product.descripcion_corta || "",
          price: finalPrice,
          stock_quantity: totalStock,
          category: product.tipo?.nombre || "Sin categoría",
          subcategory: subcategory,
          brand: brandName,
          is_featured: false,
          discount_percentage: 0,
          zureo_data: JSON.stringify({
            originalProduct: product,
            lastUpdated: new Date().toISOString(),
            priceMultiplier: impuestoMultiplier,
          }),
          updated_at: new Date().toISOString(),
          variants: variants,
        })
      }
    }

    const allProductRecords = Array.from(productsMap.values())
    console.log(`[v0] Total unique products to upsert: ${allProductRecords.length}`)
    console.log(
      `[v0] Example product with variants:`,
      allProductRecords.find((p) => p.variants.length > 0),
    )

    const { data: existingProducts } = await supabase
      .from("products_in_stock")
      .select("zureo_code, image_url")
      .in(
        "zureo_code",
        allProductRecords.map((p) => p.zureo_code),
      )

    const existingImagesMap = new Map(existingProducts?.map((p) => [p.zureo_code, p.image_url]) || [])
    console.log(`[v0] Found ${existingImagesMap.size} existing products with images`)

    const batchSize = 100
    let upsertedCount = 0
    const productIdMap = new Map()

    for (let i = 0; i < allProductRecords.length; i += batchSize) {
      const batch = allProductRecords.slice(i, i + batchSize)
      const productsToUpsert = batch.map(({ variants, ...product }) => {
        const existingImageUrl = existingImagesMap.get(product.zureo_code)
        return {
          ...product,
          image_url:
            existingImageUrl && !existingImageUrl.includes("placeholder")
              ? existingImageUrl
              : `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.name)}`,
        }
      })

      const { data: upsertedBatch, error } = await supabase
        .from("products_in_stock")
        .upsert(productsToUpsert, {
          onConflict: "zureo_code",
          ignoreDuplicates: false,
        })
        .select()

      if (error) {
        console.error(`[v0] Error upserting batch ${i / batchSize + 1}:`, error)
      } else {
        upsertedCount += batch.length

        if (upsertedBatch) {
          for (const product of upsertedBatch) {
            productIdMap.set(product.zureo_code, product.id)
          }
        }

        console.log(`[v0] Upserted batch ${i / batchSize + 1}: ${batch.length} products`)
      }
    }

    console.log("[v0] Inserting product variants...")
    let variantsInserted = 0

    for (const productRecord of allProductRecords) {
      if (productRecord.variants.length > 0) {
        const productId = productIdMap.get(productRecord.zureo_code)

        if (productId) {
          // Eliminar variantes antiguas
          await supabase.from("product_variants").delete().eq("product_id", productId)

          // Insertar nuevas variantes
          const variantsToInsert = productRecord.variants.map((variant: any) => ({
            product_id: productId,
            zureo_variety_id: variant.zureo_variety_id,
            color: variant.color,
            size: variant.size,
            stock_quantity: variant.stock_quantity,
            price: variant.price,
            variety_name: variant.variety_name,
            variety_data: variant.variety_data,
          }))

          const { error: variantError } = await supabase.from("product_variants").insert(variantsToInsert)

          if (variantError) {
            console.error(`[v0] Error inserting variants for product ${productId}:`, variantError)
          } else {
            variantsInserted += variantsToInsert.length
          }
        }
      }
    }

    console.log(`[v0] Total variants inserted: ${variantsInserted}`)

    const syncTime = new Date().toISOString()
    await supabase.from("sync_status").upsert({
      sync_type: "products",
      last_sync_at: syncTime,
      total_records: upsertedCount,
      status: "completed",
      created_at: syncTime,
      updated_at: syncTime,
    })

    const { count: withPrice } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })
      .not("price", "is", null)
      .gt("price", 0)

    const { count: withColor } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })
      .not("color", "is", null)

    const { count: withSize } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })
      .not("size", "is", null)

    const { count: withSubcategory } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })
      .not("subcategory", "is", null)

    console.log("[v0] Products with price:", withPrice)
    console.log("[v0] Products with color:", withColor)
    console.log("[v0] Products with size:", withSize)
    console.log("[v0] Products with subcategory:", withSubcategory)

    return Response.json({
      success: true,
      fromCache: false,
      summary: {
        totalFetched: allProducts.length,
        totalWithStock: productsWithStock.length,
        totalUpserted: upsertedCount,
        totalVariants: variantsInserted,
        productsWithPrice: withPrice || 0,
        productsWithColor: withColor || 0,
        productsWithSize: withSize || 0,
        productsWithSubcategory: withSubcategory || 0,
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

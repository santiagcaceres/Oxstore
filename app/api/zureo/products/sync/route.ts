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
    console.log("[v0] Cleaning existing products...")
    await supabase.from("products_in_stock").delete().neq("id", 0)
    await supabase.from("product_variants").delete().neq("id", 0)
    await supabase.from("products").delete().neq("id", 0)

    const internalProducts = productsWithStock
      .filter((product) => !product.baja) // Filtrar productos dados de baja
      .map((product) => {
        // Calcular stock total (producto + variedades)
        const mainStock = product.stock || 0
        const varietyStock =
          product.variedades?.reduce((total: number, variety: any) => total + (variety.stock || 0), 0) || 0
        const totalStock = Math.max(mainStock, varietyStock)

        const impuestoMultiplier = product.impuesto || 1.22 // Usar el impuesto del producto o 1.22 por defecto

        // Usar directamente el precio del producto principal
        const basePrice = product.precio || 0

        console.log(
          `[v0] PRECIO DEBUG - Product ${product.id} (${product.codigo}):`,
          `basePrice=${basePrice}, impuesto=${impuestoMultiplier}, producto completo:`,
          JSON.stringify({
            id: product.id,
            codigo: product.codigo,
            nombre: product.nombre,
            precio: product.precio,
            impuesto: product.impuesto,
          }),
        )

        const finalPrice = Math.round(basePrice * impuestoMultiplier)

        console.log(
          `[v0] PRECIO FINAL - Product ${product.id}: basePrice=${basePrice} * impuesto=${impuestoMultiplier} = finalPrice=${finalPrice}`,
        )

        return {
          zureo_id: product.id,
          zureo_code: product.codigo || `ZUR-${product.id}`,
          name: product.nombre || "Sin nombre",
          slug: (product.nombre || "producto").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: product.descripcion_larga || product.descripcion_corta || "",
          price: finalPrice, // Precio con multiplicador de impuesto
          precio_zureo: basePrice, // Precio original de Zureo
          stock_quantity: totalStock,
          category: product.tipo?.nombre || "Sin categoría",
          categoria_zureo: product.tipo?.nombre || "Sin categoría", // Categoría original de Zureo
          brand: product.marca?.nombre || "Sin marca",
          image_url: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.nombre || "producto")}`,
          is_featured: false,
          discount_percentage: 0,
          zureo_data: JSON.stringify({
            originalProduct: product,
            varieties: product.variedades || [],
            lastUpdated: new Date().toISOString(),
            priceMultiplier: impuestoMultiplier, // Registrar el multiplicador real usado
          }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })

    const mainProducts = internalProducts.map((product) => ({
      zureo_id: product.zureo_id,
      zureo_code: product.zureo_code,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price, // Precio con multiplicador de impuesto
      zureo_price: product.precio_zureo, // Precio original de Zureo
      stock_quantity: product.stock_quantity,
      category_id: null, // Se puede mapear después
      brand: product.brand,
      is_featured: product.is_featured,
      is_active: true,
      discount_percentage: product.discount_percentage,
      zureo_data: product.zureo_data,
      created_at: product.created_at,
      updated_at: product.updated_at,
      last_sync_at: new Date().toISOString(),
    }))

    // Insertar productos en lotes de 100
    const batchSize = 100
    let insertedCount = 0
    const insertedProducts = []
    const insertedMainProducts = []

    for (let i = 0; i < internalProducts.length; i += batchSize) {
      const batch = internalProducts.slice(i, i + batchSize)
      const mainBatch = mainProducts.slice(i, i + batchSize)

      console.log(
        `[v0] Batch ${i / batchSize + 1} sample prices:`,
        batch.slice(0, 3).map((p) => ({
          id: p.zureo_id,
          codigo: p.zureo_code,
          price: p.price,
          precio_zureo: p.precio_zureo,
          stock: p.stock_quantity,
          name: p.name,
        })),
      )

      const { data: insertedBatch, error } = await supabase.from("products_in_stock").insert(batch).select()
      const { data: insertedMainBatch, error: mainError } = await supabase.from("products").insert(mainBatch).select()

      if (error) {
        console.error(`[v0] Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        insertedCount += batch.length
        insertedProducts.push(...(insertedBatch || []))
        console.log(`[v0] Inserted batch ${i / batchSize + 1}: ${batch.length} products in products_in_stock`)
      }

      if (mainError) {
        console.error(`[v0] Error inserting main batch ${i / batchSize + 1}:`, mainError)
      } else {
        insertedMainProducts.push(...(insertedMainBatch || []))
        console.log(`[v0] Inserted batch ${i / batchSize + 1}: ${mainBatch.length} products in products table`)
      }
    }

    const { data: sampleProducts } = await supabase.from("products").select("id, name, price, zureo_price").limit(5)

    console.log("[v0] Sample products after insert:", sampleProducts)

    console.log(`[v0] Creating variants for ${insertedMainProducts.length} products`)
    let totalVariantsCreated = 0

    for (const insertedProduct of insertedMainProducts) {
      try {
        const zureoData = JSON.parse(insertedProduct.zureo_data)
        const varieties = zureoData.varieties || []
        const impuestoMultiplier = zureoData.priceMultiplier || 1.22

        if (varieties.length > 0) {
          const variants = varieties
            .filter((variety: any) => variety.stock > 0) // Solo variantes con stock
            .map((variety: any) => {
              // Extraer color y talle de los atributos con mejor lógica
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

              // Si no hay atributos, intentar extraer del nombre de la variedad
              if (!color && !size && variety.nombre) {
                const nombre = variety.nombre.toLowerCase()

                // Buscar patrones comunes de talle
                const sizePatterns = /\b(xs|s|m|l|xl|xxl|\d+)\b/i
                const sizeMatch = nombre.match(sizePatterns)
                if (sizeMatch) {
                  size = sizeMatch[0].toUpperCase()
                }

                // Buscar patrones comunes de color
                const colorPatterns =
                  /\b(negro|blanco|azul|rojo|verde|amarillo|rosa|gris|marron|beige|violeta|naranja|celeste|fucsia|dorado|plateado|black|white|blue|red|green|yellow|pink|gray|brown|purple|orange|gold|silver)\b/i
                const colorMatch = nombre.match(colorPatterns)
                if (colorMatch) {
                  color = colorMatch[0]
                }
              }

              const varietyPrice = variety.precio || insertedProduct.precio_zureo || 0
              const finalVarietyPrice = Math.round(varietyPrice * impuestoMultiplier)

              console.log(
                `[v0] Variety ${variety.id}: originalPrice=${varietyPrice}, finalPrice=${finalVarietyPrice}, color=${color}, size=${size}`,
              )

              return {
                product_id: insertedProduct.id,
                zureo_variety_id: variety.id,
                color: color,
                size: size,
                stock_quantity: variety.stock || 0,
                price: finalVarietyPrice, // Precio con multiplicador de impuesto específico
                variety_name: variety.nombre || `${color || ""} ${size || ""}`.trim() || "Variante",
                variety_data: JSON.stringify({
                  ...variety,
                  originalPrice: varietyPrice,
                  priceMultiplier: impuestoMultiplier, // Usar el multiplicador específico
                }),
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
          const originalPrice = insertedProduct.precio_zureo || 0
          const finalPrice = Math.round(originalPrice * impuestoMultiplier)

          const basicVariant = {
            product_id: insertedProduct.id,
            zureo_variety_id: null,
            color: null,
            size: null,
            stock_quantity: insertedProduct.stock_quantity,
            price: finalPrice, // Precio con multiplicador de impuesto específico
            variety_name: "Estándar",
            variety_data: JSON.stringify({
              isBasic: true,
              originalPrice: originalPrice,
              priceMultiplier: impuestoMultiplier, // Usar el multiplicador específico
            }),
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

    const { data: finalCheck } = await supabase
      .from("products")
      .select("id, name, price, zureo_price")
      .gt("price", 0)
      .limit(10)

    console.log("[v0] Final check - products with price > 0:", finalCheck?.length || 0)
    console.log("[v0] Sample products with prices:", finalCheck)

    const { data: priceCheck } = await supabase
      .from("products_in_stock")
      .select("id, zureo_code, name, price, precio_zureo, stock_quantity")
      .gt("price", 0)
      .limit(10)

    console.log("[v0] VERIFICACIÓN PRECIOS - products_in_stock con price > 0:", priceCheck?.length || 0)
    console.log("[v0] MUESTRA DE PRECIOS:", priceCheck)

    const { data: allPriceCheck } = await supabase
      .from("products_in_stock")
      .select("id, zureo_code, name, price, precio_zureo")
      .limit(5)

    console.log("[v0] MUESTRA GENERAL (primeros 5 productos):", allPriceCheck)

    return Response.json({
      success: true,
      fromCache: false,
      summary: {
        totalFetched: allProducts.length,
        totalWithStock: productsWithStock.length,
        totalInserted: insertedCount,
        totalMainProducts: insertedMainProducts.length,
        totalVariantsCreated: totalVariantsCreated,
        productsWithPrices: finalCheck?.length || 0,
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

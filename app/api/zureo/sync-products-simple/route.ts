import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

function extractColorAndSize(variety: any): { color: string | null; size: string | null } {
  let color = null
  let size = null

  if (variety.atributos && Array.isArray(variety.atributos)) {
    for (const attr of variety.atributos) {
      const atributoName = (attr.atributo || "").toLowerCase()
      const valor = attr.valor || ""

      if (atributoName.includes("color") || atributoName.includes("colour")) {
        color = valor
      } else if (atributoName.includes("talle") || atributoName.includes("size") || atributoName.includes("talla")) {
        size = valor
      }
    }
  }

  return { color, size }
}

export async function POST() {
  try {
    console.log("[v0] Iniciando sincronización inteligente de productos")

    const supabase = await createClient()

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
    const limit = 500
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

      if (products.length < limit) {
        break
      }

      offset += limit
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    console.log(`[v0] Total de productos obtenidos: ${allProducts.length}`)

    const { count: beforeCount } = await supabase.from("products_in_stock").select("*", { count: "exact", head: true })

    console.log(`[v0] Productos en DB antes de limpiar: ${beforeCount}`)

    console.log("[v0] Limpiando productos existentes...")
    const { error: deleteError } = await supabase.from("products_in_stock").delete().neq("id", 0)

    if (deleteError) {
      console.error("[v0] Error al limpiar productos:", deleteError)
      throw new Error(`Error al limpiar productos: ${deleteError.message}`)
    }

    const { count: afterDeleteCount } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })

    console.log(`[v0] Productos en DB después de limpiar: ${afterDeleteCount}`)

    let productsWithStock = 0
    const allProductRecords = []

    for (const product of allProducts) {
      try {
        // Calcular precio con impuesto (igual que en el admin)
        const impuestoMultiplier = product.impuesto || 1.22
        const basePrice = Number.parseFloat(product.precio) || 0

        // Si el producto tiene variedades, crear un registro por cada variedad
        if (product.variedades && Array.isArray(product.variedades) && product.variedades.length > 0) {
          for (const variety of product.variedades) {
            if (variety.stock > 0) {
              const { color, size } = extractColorAndSize(variety)
              const varietyPrice = Number.parseFloat(variety.precio) || basePrice
              const finalPrice = Math.round(varietyPrice * impuestoMultiplier)

              allProductRecords.push({
                zureo_id: product.id?.toString(),
                zureo_code: product.codigo || product.code || product.id?.toString(),
                name: product.nombre || product.name || "Producto sin nombre",
                slug: `${product.id}-${variety.id}-${
                  product.nombre
                    ?.toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "") || "producto"
                }`,
                description:
                  product.descripcion_larga || product.descripcion_corta || product.description || "Sin descripción",
                price: finalPrice,
                precio_zureo: varietyPrice,
                stock_quantity: Number.parseInt(variety.stock) || 0,
                category: product.tipo?.nombre || product.category || "Sin categoría",
                categoria_zureo: product.tipo?.nombre || product.category || "Sin categoría",
                brand: product.marca?.nombre || product.brand || "Sin marca",
                color: color,
                size: size,
                image_url: product.imagen || product.image || "/placeholder.svg?height=300&width=300",
                is_active: true,
                is_featured: false,
                zureo_data: JSON.stringify({
                  originalProduct: product,
                  variety: variety,
                  lastUpdated: new Date().toISOString(),
                  priceMultiplier: impuestoMultiplier,
                }),
                last_sync_at: new Date().toISOString(),
              })

              productsWithStock++
            }
          }
        } else {
          // Producto sin variedades
          if (product.stock > 0) {
            const finalPrice = Math.round(basePrice * impuestoMultiplier)

            allProductRecords.push({
              zureo_id: product.id?.toString(),
              zureo_code: product.codigo || product.code || product.id?.toString(),
              name: product.nombre || product.name || "Producto sin nombre",
              slug: `${product.id}-${
                product.nombre
                  ?.toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "") || "producto"
              }`,
              description:
                product.descripcion_larga || product.descripcion_corta || product.description || "Sin descripción",
              price: finalPrice,
              precio_zureo: basePrice,
              stock_quantity: Number.parseInt(product.stock) || 0,
              category: product.tipo?.nombre || product.category || "Sin categoría",
              categoria_zureo: product.tipo?.nombre || product.category || "Sin categoría",
              brand: product.marca?.nombre || product.brand || "Sin marca",
              color: null,
              size: null,
              image_url: product.imagen || product.image || "/placeholder.svg?height=300&width=300",
              is_active: true,
              is_featured: false,
              zureo_data: JSON.stringify({
                originalProduct: product,
                lastUpdated: new Date().toISOString(),
                priceMultiplier: impuestoMultiplier,
              }),
              last_sync_at: new Date().toISOString(),
            })

            productsWithStock++
          }
        }
      } catch (error) {
        console.error(`[v0] Error procesando producto ${product.id}:`, error)
      }
    }

    console.log(`[v0] Total de registros a insertar: ${allProductRecords.length}`)
    console.log("[v0] Muestra de primeros 3 registros:")
    allProductRecords.slice(0, 3).forEach((record, index) => {
      console.log(`[v0] Registro ${index + 1}:`, {
        zureo_code: record.zureo_code,
        name: record.name,
        price: record.price,
        precio_zureo: record.precio_zureo,
        color: record.color,
        size: record.size,
        stock_quantity: record.stock_quantity,
      })
    })

    const batchSize = 100
    let insertedCount = 0
    let errorCount = 0

    for (let i = 0; i < allProductRecords.length; i += batchSize) {
      const batch = allProductRecords.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(allProductRecords.length / batchSize)

      console.log(`[v0] Insertando lote ${batchNumber}/${totalBatches}: ${batch.length} productos`)

      const { data, error } = await supabase.from("products_in_stock").insert(batch).select()

      if (error) {
        console.error(`[v0] Error insertando lote ${batchNumber}:`, error)
        console.error(`[v0] Detalles del error:`, JSON.stringify(error, null, 2))
        errorCount++
      } else {
        insertedCount += data?.length || 0
        console.log(`[v0] Lote ${batchNumber} insertado exitosamente: ${data?.length || 0} productos`)
      }
    }

    console.log(`[v0] Resumen de inserción:`)
    console.log(`[v0] - Total a insertar: ${allProductRecords.length}`)
    console.log(`[v0] - Insertados exitosamente: ${insertedCount}`)
    console.log(`[v0] - Lotes con errores: ${errorCount}`)

    const { count: afterInsertCount } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })

    console.log(`[v0] Productos en DB después de insertar: ${afterInsertCount}`)

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

    console.log(`[v0] Productos con precio: ${withPrice}`)
    console.log(`[v0] Productos con color: ${withColor}`)
    console.log(`[v0] Productos con talle: ${withSize}`)

    await supabase.from("sync_status").upsert(
      {
        sync_type: "products",
        status: "completed",
        total_records: insertedCount,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "sync_type",
      },
    )

    console.log(`[v0] Sincronización completada: ${insertedCount} productos guardados`)

    return NextResponse.json({
      success: true,
      totalProducts: allProducts.length,
      productsWithStock,
      savedProducts: insertedCount,
      productsWithPrice: withPrice || 0,
      productsWithColor: withColor || 0,
      productsWithSize: withSize || 0,
      errorBatches: errorCount,
      requests,
      timestamp: new Date().toISOString(),
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

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
  console.log("[v0] ========================================")
  console.log("[v0] INICIANDO SINCRONIZACIÓN INCREMENTAL DE PRODUCTOS")
  console.log("[v0] ========================================")

  try {
    const supabase = await createClient()

    // Verificar conexión a la base de datos
    console.log("[v0] Verificando conexión a la base de datos...")
    const { count: testCount, error: testError } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })

    if (testError) {
      console.error("[v0] ERROR: No se puede conectar a la base de datos:", testError)
      throw new Error(`Error de conexión a DB: ${testError.message}`)
    }

    console.log(`[v0] ✓ Conexión exitosa. Productos actuales en DB: ${testCount}`)

    // Paso 1: Obtener token
    console.log("[v0] Paso 1: Obteniendo token de autenticación de Zureo...")

    const username = process.env.ZUREO_USERNAME
    const password = process.env.ZUREO_PASSWORD
    const domain = process.env.ZUREO_DOMAIN
    const companyId = process.env.ZUREO_COMPANY_ID || "1"
    const baseUrl = process.env.ZUREO_API_URL || "https://api.zureo.com"

    if (!username || !password || !domain) {
      throw new Error("Variables de entorno de Zureo no configuradas correctamente")
    }

    const credentials = Buffer.from(`${username}:${password}:${domain}`).toString("base64")

    const authResponse = await fetch(`${baseUrl}/sdk/v1/security/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
    })

    if (!authResponse.ok) {
      throw new Error(`Error de autenticación: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    if (!token) {
      throw new Error("No se recibió token de autenticación")
    }

    console.log("[v0] ✓ Token obtenido exitosamente")

    // Paso 2: Obtener productos con paginación
    console.log("[v0] Paso 2: Obteniendo productos desde Zureo...")

    let allProducts: any[] = []
    let offset = 0
    const limit = 500

    while (true) {
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
        throw new Error(`Error al obtener productos: ${productsResponse.status}`)
      }

      const productsData = await productsResponse.json()
      const products = productsData.data || []

      allProducts = allProducts.concat(products)

      console.log(`[v0] ✓ Obtenidos ${products.length} productos (Total: ${allProducts.length})`)

      if (products.length < limit) {
        break
      }

      offset += limit
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    console.log(`[v0] ✓ TOTAL DE PRODUCTOS OBTENIDOS: ${allProducts.length}`)

    console.log("[v0] Paso 3: Procesando productos...")

    // Crear todos los registros de productos
    const allProductRecords = []
    let productsProcessed = 0
    let productsWithStock = 0
    let productsWithoutStock = 0

    for (const product of allProducts) {
      productsProcessed++

      try {
        const impuestoMultiplier = product.impuesto || 1.22
        const basePrice = Number.parseFloat(product.precio) || 0

        let categoriaGenero = null
        if (product.tipo?.genero) {
          categoriaGenero = product.tipo.genero.toLowerCase()
        } else if (product.genero) {
          categoriaGenero = product.genero.toLowerCase()
        }

        const categoryName = product.tipo?.nombre || product.category || ""
        // const subcategory = mapCategoryToSubcategory(categoryName)

        // Si el producto tiene variedades
        if (product.variedades && Array.isArray(product.variedades) && product.variedades.length > 0) {
          for (const variety of product.variedades) {
            const stock = Number.parseInt(variety.stock) || 0

            if (stock > 0) {
              const { color, size } = extractColorAndSize(variety)
              const varietyPrice = Number.parseFloat(variety.precio) || basePrice
              const finalPrice = Math.round(varietyPrice * impuestoMultiplier)

              allProductRecords.push({
                zureo_id: product.id?.toString(),
                zureo_code: product.codigo || product.code || product.id?.toString(),
                name: product.nombre || product.name || "Producto sin nombre",
                description:
                  product.descripcion_larga || product.descripcion_corta || product.description || "Sin descripción",
                price: finalPrice,
                stock_quantity: stock,
                category: product.tipo?.nombre || product.category || "Sin categoría",
                // subcategory: subcategory,
                brand: (product.marca?.nombre || product.brand || "Sin marca").toUpperCase(),
                color: color,
                size: size,
                // categoria_genero: categoriaGenero,
                image_url: product.imagen || product.image || "/placeholder.svg?height=300&width=300",
                is_active: true,
                is_featured: false,
              })

              productsWithStock++
            } else {
              productsWithoutStock++
            }
          }
        } else {
          // Producto sin variedades
          const stock = Number.parseInt(product.stock) || 0

          if (stock > 0) {
            const finalPrice = Math.round(basePrice * impuestoMultiplier)

            allProductRecords.push({
              zureo_id: product.id?.toString(),
              zureo_code: product.codigo || product.code || product.id?.toString(),
              name: product.nombre || product.name || "Producto sin nombre",
              description:
                product.descripcion_larga || product.descripcion_corta || product.description || "Sin descripción",
              price: finalPrice,
              stock_quantity: stock,
              category: product.tipo?.nombre || product.category || "Sin categoría",
              // subcategory: subcategory,
              brand: (product.marca?.nombre || product.brand || "Sin marca").toUpperCase(),
              color: null,
              size: null,
              // categoria_genero: categoriaGenero,
              image_url: product.imagen || product.image || "/placeholder.svg?height=300&width=300",
              is_active: true,
              is_featured: false,
            })

            productsWithStock++
          } else {
            productsWithoutStock++
          }
        }
      } catch (error) {
        console.error(`[v0] ERROR procesando producto ${product.id}:`, error)
      }
    }

    console.log(`[v0] ✓ Productos procesados: ${productsProcessed}`)
    console.log(`[v0] ✓ Productos con stock: ${productsWithStock}`)
    console.log(`[v0] ✓ Productos sin stock: ${productsWithoutStock}`)
    console.log(`[v0] ✓ Total registros para guardar: ${allProductRecords.length}`)

    if (allProductRecords.length === 0) {
      console.log("[v0] ⚠️ No hay productos con stock para sincronizar")
      return NextResponse.json({
        success: false,
        error: "No hay productos con stock para sincronizar",
        totalProducts: allProducts.length,
        savedProducts: 0,
        inserted: 0,
        updated: 0,
        deactivated: 0,
        totalInDb: testCount || 0,
        activeInDb: 0,
        timestamp: new Date().toISOString(),
      })
    }

    console.log("[v0] Paso 4: Insertando productos en la base de datos...")

    let insertedCount = 0
    const batchSize = 100

    for (let i = 0; i < allProductRecords.length; i += batchSize) {
      const batch = allProductRecords.slice(i, i + batchSize)
      console.log(`[v0] Insertando lote ${Math.floor(i / batchSize) + 1} (${batch.length} productos)...`)

      const { data, error } = await supabase.from("products_in_stock").insert(batch).select()

      if (error) {
        console.error(`[v0] ✗ ERROR insertando lote:`, error)
        console.error(`[v0] Detalles del error:`, JSON.stringify(error, null, 2))
      } else {
        insertedCount += data?.length || 0
        console.log(`[v0] ✓ Insertados ${data?.length || 0} productos`)
      }
    }

    console.log(`[v0] ✓ Total insertado: ${insertedCount} productos`)

    // Verificar resultados
    const { count: totalCount } = await supabase.from("products_in_stock").select("*", { count: "exact", head: true })

    const { count: activeCount } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    console.log(`[v0] ✓ Total productos en BD: ${totalCount}`)
    console.log(`[v0] ✓ Productos activos: ${activeCount}`)

    console.log(`[v0] ========================================`)
    console.log(`[v0] ✓ SINCRONIZACIÓN COMPLETADA`)
    console.log(`[v0] ========================================`)

    return NextResponse.json({
      success: true,
      totalProducts: allProducts.length,
      savedProducts: insertedCount,
      inserted: insertedCount,
      updated: 0,
      deactivated: 0,
      totalInDb: totalCount,
      activeInDb: activeCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] ========================================")
    console.error("[v0] ✗ ERROR CRÍTICO EN SINCRONIZACIÓN")
    console.error("[v0] ========================================")
    console.error("[v0] Error:", error)

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

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

    console.log("[v0] Variables de entorno:")
    console.log(`[v0] - ZUREO_USERNAME: ${username ? "✓ Configurado" : "✗ NO configurado"}`)
    console.log(`[v0] - ZUREO_PASSWORD: ${password ? "✓ Configurado" : "✗ NO configurado"}`)
    console.log(`[v0] - ZUREO_DOMAIN: ${domain ? "✓ Configurado" : "✗ NO configurado"}`)
    console.log(`[v0] - ZUREO_COMPANY_ID: ${companyId}`)
    console.log(`[v0] - ZUREO_API_URL: ${baseUrl}`)

    if (!username || !password || !domain) {
      throw new Error("Variables de entorno de Zureo no configuradas correctamente")
    }

    // Crear credenciales Basic Auth
    const credentials = Buffer.from(`${username}:${password}:${domain}`).toString("base64")

    console.log("[v0] Enviando solicitud de autenticación...")
    const authResponse = await fetch(`${baseUrl}/sdk/v1/security/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
    })

    console.log(`[v0] Respuesta de autenticación: ${authResponse.status} ${authResponse.statusText}`)

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.error("[v0] ERROR en autenticación:", errorText)
      throw new Error(`Error de autenticación: ${authResponse.status} - ${errorText}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    if (!token) {
      console.error("[v0] ERROR: No se recibió token en la respuesta")
      throw new Error("No se recibió token de autenticación")
    }

    console.log("[v0] ✓ Token obtenido exitosamente")

    // Paso 2: Obtener productos con paginación
    console.log("[v0] Paso 2: Obteniendo productos desde Zureo...")

    let allProducts: any[] = []
    let offset = 0
    const limit = 500
    let requests = 0

    while (true) {
      console.log(`[v0] Solicitando productos desde ${offset} hasta ${offset + limit}...`)

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

      console.log(`[v0] Respuesta de productos: ${productsResponse.status} ${productsResponse.statusText}`)

      if (!productsResponse.ok) {
        const errorText = await productsResponse.text()
        console.error("[v0] ERROR al obtener productos:", errorText)
        throw new Error(`Error al obtener productos: ${productsResponse.status} - ${errorText}`)
      }

      const productsData = await productsResponse.json()
      const products = productsData.data || []

      requests++
      allProducts = allProducts.concat(products)

      console.log(
        `[v0] ✓ Obtenidos ${products.length} productos en esta página (Total acumulado: ${allProducts.length})`,
      )

      if (products.length < limit) {
        console.log("[v0] Última página alcanzada")
        break
      }

      offset += limit
      console.log("[v0] Esperando 5 segundos antes de la siguiente solicitud...")
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    console.log(`[v0] ========================================`)
    console.log(`[v0] ✓ TOTAL DE PRODUCTOS OBTENIDOS: ${allProducts.length}`)
    console.log(`[v0] ========================================`)

    // Paso 3: Procesar productos para sincronización incremental
    console.log("[v0] Paso 3: Procesando productos...")

    let productsWithStock = 0
    const allProductRecords = []

    for (const product of allProducts) {
      try {
        // Calcular precio con impuesto (igual que en el admin)
        const impuestoMultiplier = product.impuesto || 1.22
        const basePrice = Number.parseFloat(product.precio) || 0

        let categoriaGenero = null
        if (product.tipo?.genero) {
          categoriaGenero = product.tipo.genero.toLowerCase()
        } else if (product.genero) {
          categoriaGenero = product.genero.toLowerCase()
        }

        // Mapear categoría a subcategoría
        const categoryName = (product.tipo?.nombre || product.category || "").toLowerCase()
        let subcategory = null

        if (categoryName.includes("remera") || categoryName.includes("camiseta")) subcategory = "Remeras"
        else if (categoryName.includes("pantalon") || categoryName.includes("jean")) subcategory = "Pantalones"
        else if (categoryName.includes("buzo")) subcategory = "Buzos"
        else if (categoryName.includes("campera") || categoryName.includes("jacket")) subcategory = "Camperas"
        else if (categoryName.includes("zapatilla") || categoryName.includes("calzado")) subcategory = "Zapatillas"
        else if (categoryName.includes("short")) subcategory = "Shorts"
        else if (categoryName.includes("vestido")) subcategory = "Vestidos"
        else if (categoryName.includes("pollera") || categoryName.includes("falda")) subcategory = "Polleras"
        else if (categoryName.includes("accesorio")) subcategory = "Accesorios"

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
                description:
                  product.descripcion_larga || product.descripcion_corta || product.description || "Sin descripción",
                price: finalPrice,
                stock_quantity: Number.parseInt(variety.stock) || 0,
                category: product.tipo?.nombre || product.category || "Sin categoría",
                subcategory: subcategory,
                brand: (product.marca?.nombre || product.brand || "Sin marca").toUpperCase(),
                color: color,
                size: size,
                categoria_genero: categoriaGenero,
                image_url: product.imagen || product.image || "/placeholder.svg?height=300&width=300",
                is_active: true,
                is_featured: false,
              })

              productsWithStock++
            }
          }
        } else {
          // Producto sin variedades
          if (product.stock > 0) {
            const finalPrice = Math.round(basePrice * impuestoMultiplier)
            const zureoCode = product.codigo || product.code || product.id?.toString()

            allProductRecords.push({
              zureo_id: product.id?.toString(),
              zureo_code: zureoCode,
              name: product.nombre || product.name || "Producto sin nombre",
              description:
                product.descripcion_larga || product.descripcion_corta || product.description || "Sin descripción",
              price: finalPrice,
              stock_quantity: Number.parseInt(product.stock) || 0,
              category: product.tipo?.nombre || product.category || "Sin categoría",
              subcategory: subcategory,
              brand: (product.marca?.nombre || product.brand || "Sin marca").toUpperCase(),
              color: null,
              size: null,
              categoria_genero: categoriaGenero,
              image_url: product.imagen || product.image || "/placeholder.svg?height=300&width=300",
              is_active: true,
              is_featured: false,
            })

            productsWithStock++
          }
        }
      } catch (error) {
        console.error(`[v0] ERROR procesando producto ${product.id}:`, error)
      }
    }

    console.log(`[v0] ✓ Total de registros preparados para insertar: ${allProductRecords.length}`)

    if (allProductRecords.length === 0) {
      console.log("[v0] ⚠️ No hay productos para insertar. No se realizará ninguna acción.")
      return NextResponse.json({
        success: false,
        error: "No hay productos con stock para sincronizar",
        timestamp: new Date().toISOString(),
      })
    }

    console.log("[v0] Paso 4: Identificando productos existentes en la base de datos...")

    const { data: existingProducts, error: fetchError } = await supabase
      .from("products_in_stock")
      .select("id, zureo_code, color, size, image_url")

    if (fetchError) {
      console.error("[v0] ERROR al obtener productos existentes:", fetchError)
      throw new Error(`Error al obtener productos existentes: ${fetchError.message}`)
    }

    console.log(`[v0] ✓ Productos existentes en BD: ${existingProducts?.length || 0}`)

    // Crear un mapa de productos existentes por zureo_code + color + size
    const existingProductsMap = new Map()
    for (const product of existingProducts || []) {
      const key = `${product.zureo_code}-${product.color || "null"}-${product.size || "null"}`
      existingProductsMap.set(key, product)
    }

    console.log(`[v0] ✓ Mapa de productos existentes creado: ${existingProductsMap.size} variantes`)

    // Crear un Set de productos activos en Zureo
    const zureoProductsSet = new Set()
    const productsToInsert = []
    const productsToUpdate = []

    for (const product of allProducts) {
      try {
        const impuestoMultiplier = product.impuesto || 1.22
        const basePrice = Number.parseFloat(product.precio) || 0

        let categoriaGenero = null
        if (product.tipo?.genero) {
          categoriaGenero = product.tipo.genero.toLowerCase()
        } else if (product.genero) {
          categoriaGenero = product.genero.toLowerCase()
        }

        // Mapear categoría a subcategoría
        const categoryName = (product.tipo?.nombre || product.category || "").toLowerCase()
        let subcategory = null

        if (categoryName.includes("remera") || categoryName.includes("camiseta")) subcategory = "Remeras"
        else if (categoryName.includes("pantalon") || categoryName.includes("jean")) subcategory = "Pantalones"
        else if (categoryName.includes("buzo")) subcategory = "Buzos"
        else if (categoryName.includes("campera") || categoryName.includes("jacket")) subcategory = "Camperas"
        else if (categoryName.includes("zapatilla") || categoryName.includes("calzado")) subcategory = "Zapatillas"
        else if (categoryName.includes("short")) subcategory = "Shorts"
        else if (categoryName.includes("vestido")) subcategory = "Vestidos"
        else if (categoryName.includes("pollera") || categoryName.includes("falda")) subcategory = "Polleras"
        else if (categoryName.includes("accesorio")) subcategory = "Accesorios"

        // Si el producto tiene variedades, procesar cada una
        if (product.variedades && Array.isArray(product.variedades) && product.variedades.length > 0) {
          for (const variety of product.variedades) {
            if (variety.stock > 0) {
              const { color, size } = extractColorAndSize(variety)
              const varietyPrice = Number.parseFloat(variety.precio) || basePrice
              const finalPrice = Math.round(varietyPrice * impuestoMultiplier)

              const zureoCode = product.codigo || product.code || product.id?.toString()
              const key = `${zureoCode}-${color || "null"}-${size || "null"}`
              zureoProductsSet.add(key)

              const productData = {
                zureo_id: product.id?.toString(),
                zureo_code: zureoCode,
                name: product.nombre || product.name || "Producto sin nombre",
                description:
                  product.descripcion_larga || product.descripcion_corta || product.description || "Sin descripción",
                price: finalPrice,
                stock_quantity: Number.parseInt(variety.stock) || 0,
                category: product.tipo?.nombre || product.category || "Sin categoría",
                subcategory: subcategory,
                brand: (product.marca?.nombre || product.brand || "Sin marca").toUpperCase(),
                color: color,
                size: size,
                categoria_genero: categoriaGenero,
                image_url: product.imagen || product.image || "/placeholder.svg?height=300&width=300",
                is_active: true,
                is_featured: false,
              }

              const existingProduct = existingProductsMap.get(key)
              if (existingProduct) {
                // Producto existe: actualizar pero CONSERVAR image_url si ya tiene una personalizada
                productsToUpdate.push({
                  id: existingProduct.id,
                  ...productData,
                  // Conservar la imagen existente si no es un placeholder
                  image_url:
                    existingProduct.image_url && !existingProduct.image_url.includes("placeholder")
                      ? existingProduct.image_url
                      : productData.image_url,
                })
              } else {
                // Producto nuevo: insertar
                productsToInsert.push(productData)
              }
            }
          }
        } else {
          // Producto sin variedades
          if (product.stock > 0) {
            const finalPrice = Math.round(basePrice * impuestoMultiplier)
            const zureoCode = product.codigo || product.code || product.id?.toString()
            const key = `${zureoCode}-null-null`
            zureoProductsSet.add(key)

            const productData = {
              zureo_id: product.id?.toString(),
              zureo_code: zureoCode,
              name: product.nombre || product.name || "Producto sin nombre",
              description:
                product.descripcion_larga || product.descripcion_corta || product.description || "Sin descripción",
              price: finalPrice,
              stock_quantity: Number.parseInt(product.stock) || 0,
              category: product.tipo?.nombre || product.category || "Sin categoría",
              subcategory: subcategory,
              brand: (product.marca?.nombre || product.brand || "Sin marca").toUpperCase(),
              color: null,
              size: null,
              categoria_genero: categoriaGenero,
              image_url: product.imagen || product.image || "/placeholder.svg?height=300&width=300",
              is_active: true,
              is_featured: false,
            }

            const existingProduct = existingProductsMap.get(key)
            if (existingProduct) {
              productsToUpdate.push({
                id: existingProduct.id,
                ...productData,
                image_url:
                  existingProduct.image_url && !existingProduct.image_url.includes("placeholder")
                    ? existingProduct.image_url
                    : productData.image_url,
              })
            } else {
              productsToInsert.push(productData)
            }
          }
        }
      } catch (error) {
        console.error(`[v0] ERROR procesando producto ${product.id}:`, error)
      }
    }

    console.log(`[v0] ✓ Productos a insertar (nuevos): ${productsToInsert.length}`)
    console.log(`[v0] ✓ Productos a actualizar (existentes): ${productsToUpdate.length}`)

    // Identificar productos que ya no están en Zureo (marcar como inactivos en lugar de borrar)
    const productsToDeactivate = []
    for (const [key, product] of existingProductsMap) {
      if (!zureoProductsSet.has(key)) {
        productsToDeactivate.push(product.id)
      }
    }

    console.log(`[v0] ✓ Productos a desactivar (sin stock en Zureo): ${productsToDeactivate.length}`)

    // Paso 5: Insertar productos nuevos
    let insertedCount = 0
    if (productsToInsert.length > 0) {
      console.log("[v0] Paso 5: Insertando productos nuevos...")
      const batchSize = 100

      for (let i = 0; i < productsToInsert.length; i += batchSize) {
        const batch = productsToInsert.slice(i, i + batchSize)
        const { data, error } = await supabase.from("products_in_stock").insert(batch).select()

        if (error) {
          console.error(`[v0] ✗ ERROR insertando lote:`, error)
        } else {
          insertedCount += data?.length || 0
          console.log(`[v0] ✓ Insertados ${data?.length || 0} productos nuevos`)
        }
      }
    }

    // Paso 6: Actualizar productos existentes
    let updatedCount = 0
    if (productsToUpdate.length > 0) {
      console.log("[v0] Paso 6: Actualizando productos existentes...")

      for (const product of productsToUpdate) {
        const { id, ...updateData } = product
        const { error } = await supabase.from("products_in_stock").update(updateData).eq("id", id)

        if (error) {
          console.error(`[v0] ✗ ERROR actualizando producto ${id}:`, error)
        } else {
          updatedCount++
        }
      }

      console.log(`[v0] ✓ Actualizados ${updatedCount} productos`)
    }

    // Paso 7: Desactivar productos sin stock (NO borrar para conservar imágenes)
    let deactivatedCount = 0
    if (productsToDeactivate.length > 0) {
      console.log("[v0] Paso 7: Desactivando productos sin stock...")

      const { error } = await supabase
        .from("products_in_stock")
        .update({ is_active: false, stock_quantity: 0 })
        .in("id", productsToDeactivate)

      if (error) {
        console.error(`[v0] ✗ ERROR desactivando productos:`, error)
      } else {
        deactivatedCount = productsToDeactivate.length
        console.log(`[v0] ✓ Desactivados ${deactivatedCount} productos (conservando imágenes)`)
      }
    }

    // Paso 8: Verificar resultados
    console.log("[v0] Paso 8: Verificando resultados...")

    const { count: totalCount } = await supabase.from("products_in_stock").select("*", { count: "exact", head: true })

    const { count: activeCount } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    console.log(`[v0] ✓ Total productos en BD: ${totalCount}`)
    console.log(`[v0] ✓ Productos activos: ${activeCount}`)

    // Actualizar estado de sincronización
    await supabase.from("sync_status").upsert(
      {
        sync_type: "products",
        status: "completed",
        total_records: activeCount,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "sync_type",
      },
    )

    console.log(`[v0] ========================================`)
    console.log(`[v0] ✓ SINCRONIZACIÓN INCREMENTAL COMPLETADA`)
    console.log(`[v0] ✓ Nuevos: ${insertedCount}`)
    console.log(`[v0] ✓ Actualizados: ${updatedCount}`)
    console.log(`[v0] ✓ Desactivados: ${deactivatedCount}`)
    console.log(`[v0] ========================================`)

    return NextResponse.json({
      success: true,
      totalProducts: allProducts.length,
      inserted: insertedCount,
      updated: updatedCount,
      deactivated: deactivatedCount,
      totalInDb: totalCount,
      activeInDb: activeCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] ========================================")
    console.error("[v0] ✗ ERROR CRÍTICO EN SINCRONIZACIÓN")
    console.error("[v0] ========================================")
    console.error("[v0] Error:", error)
    console.error("[v0] Stack:", error instanceof Error ? error.stack : "No stack trace")

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

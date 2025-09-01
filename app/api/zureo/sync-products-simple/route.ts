import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    console.log("[v0] Iniciando sincronización de productos")

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
    const limit = 500 // Reducir límite para evitar rate limiting
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

      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    console.log(`[v0] Total de productos obtenidos: ${allProducts.length}`)

    let savedProducts = 0
    let productsWithStock = 0

    for (const product of allProducts) {
      try {
        // Verificar si el producto tiene stock
        const hasStock = product.stock > 0 || (product.varieties && product.varieties.some((v: any) => v.stock > 0))

        if (!hasStock) {
          continue // Saltar productos sin stock
        }

        productsWithStock++

        // Crear slug único
        const slug = `${product.id}-${
          product.name
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || "producto"
        }`

        // Guardar en la tabla products_in_stock
        const { error } = await supabase.from("products_in_stock").upsert(
          {
            zureo_id: product.id?.toString(),
            zureo_code: product.codigo || product.code || product.id?.toString(),
            name: product.name || "Producto sin nombre",
            description: product.description || product.name || "Sin descripción",
            price: Number.parseFloat(product.price) || 0,
            stock_quantity: Number.parseInt(product.stock) || 0,
            category: product.category || "Sin categoría",
            brand: product.brand || "Sin marca",
            image_url: product.image || "/placeholder.svg?height=300&width=300",
            is_active: true,
            is_featured: false,
            zureo_data: product,
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "zureo_id",
          },
        )

        if (error) {
          console.error(`[v0] Error guardando producto ${product.id}:`, error)
        } else {
          savedProducts++
          if (savedProducts % 50 === 0) {
            console.log(`[v0] ${savedProducts} productos guardados...`)
          }
        }
      } catch (error) {
        console.error(`[v0] Error procesando producto ${product.id}:`, error)
      }
    }

    await supabase.from("sync_status").upsert(
      {
        sync_type: "products",
        status: "completed",
        total_records: savedProducts,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "sync_type",
      },
    )

    console.log(`[v0] ${savedProducts} productos con stock guardados en la base de datos`)

    return NextResponse.json({
      success: true,
      totalProducts: allProducts.length,
      productsWithStock,
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

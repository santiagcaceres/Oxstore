import { NextResponse } from "next/server"

async function getAllZureoProductsWithPagination() {
  const allProducts = []
  let offset = 0
  const limit = 1000
  let hasMoreData = true

  // Verificar credenciales
  const zureoUser = process.env.ZUREO_API_USER
  const zureoPassword = process.env.ZUREO_API_PASSWORD
  const zureoDomain = process.env.ZUREO_DOMAIN
  const zureoCompanyId = process.env.ZUREO_COMPANY_ID

  if (!zureoUser || !zureoPassword || !zureoDomain || !zureoCompanyId) {
    throw new Error("Credenciales de Zureo no configuradas")
  }

  try {
    // Obtener token de autenticación
    const authResponse = await fetch(`https://${zureoDomain}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario: zureoUser,
        password: zureoPassword,
      }),
    })

    if (!authResponse.ok) {
      throw new Error(`Error de autenticación: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    if (!token) {
      throw new Error("No se pudo obtener el token de autenticación")
    }

    // Obtener productos con paginación
    while (hasMoreData) {
      const productsResponse = await fetch(
        `https://${zureoDomain}/api/productos?empresa=${zureoCompanyId}&limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!productsResponse.ok) {
        throw new Error(`Error obteniendo productos: ${productsResponse.status}`)
      }

      const productsData = await productsResponse.json()

      if (Array.isArray(productsData) && productsData.length > 0) {
        allProducts.push(...productsData)
        offset += limit

        // Si recibimos menos productos que el límite, no hay más datos
        if (productsData.length < limit) {
          hasMoreData = false
        }
      } else {
        hasMoreData = false
      }
    }

    return allProducts
  } catch (error) {
    console.error("Error en paginación de productos Zureo:", error)
    throw error
  }
}

export async function GET() {
  try {
    console.log("[v0] Iniciando carga de productos con paginación")

    const allProducts = await getAllZureoProductsWithPagination()

    console.log("[v0] Total productos obtenidos:", allProducts.length)

    // Filtrar productos con stock > 0
    const productsWithStock = allProducts
      .filter((product: any) => {
        // Verificar stock del producto principal
        if (product.stock && product.stock > 0) return true

        // Verificar stock en variedades
        if (product.variedades && Array.isArray(product.variedades)) {
          return product.variedades.some((variedad: any) => variedad.stock && variedad.stock > 0)
        }

        return false
      })
      .map((product: any) => ({
        id: product.id,
        codigo: product.codigo,
        nombre: product.nombre,
        stock: product.stock || 0,
        precio: product.precio || 0,
        marca: {
          id: product.marca?.id || 0,
          nombre: product.marca?.nombre || "Sin marca",
        },
        tipo: product.tipo || { id: 0, nombre: "Sin tipo" },
        variedades: product.variedades || [],
        fechaAlta: product.fecha_alta,
        fechaModificado: product.fecha_modificado,
        descripcionCorta: product.descripcion_corta,
        descripcionLarga: product.descripcion_larga,
        impuesto: product.impuesto,
        unidadMedida: product.unidad_de_medida,
      }))

    console.log("[v0] Productos con stock filtrados:", productsWithStock.length)

    return NextResponse.json({
      success: true,
      data: productsWithStock,
      message: `Productos con stock > 0: ${productsWithStock.length} de ${allProducts.length} productos`,
      totalProducts: allProducts.length,
      productsWithStock: productsWithStock.length,
      totalStockValue: productsWithStock.reduce((sum: number, p: any) => sum + p.stock * p.precio, 0),
    })
  } catch (error) {
    console.error("[v0] Error en products-with-stock:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        data: [],
        totalProducts: 0,
        productsWithStock: 0,
        totalStockValue: 0,
      },
      { status: 500 },
    )
  }
}

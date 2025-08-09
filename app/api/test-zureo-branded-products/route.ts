import { NextResponse } from "next/server"
import { getProductsFromZureo } from "@/lib/zureo-api"

export async function GET() {
  try {
    const products = await getProductsFromZureo()

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({
        success: false,
        message: "No se pudieron obtener los productos",
      })
    }

    // Filtrar productos que tienen marca asignada (marca.nombre != null)
    const brandedProducts = products.filter(
      (product) => product.marca && product.marca.nombre && product.marca.nombre.trim() !== "",
    )

    return NextResponse.json({
      success: true,
      message: `Se encontraron ${brandedProducts.length} productos con marca de un total de ${products.length}`,
      data: brandedProducts.map((product) => ({
        id: product.id,
        codigo: product.codigo,
        nombre: product.nombre,
        precio: product.precio,
        marca: {
          id: product.marca.id,
          nombre: product.marca.nombre,
        },
        stock: product.stock,
      })),
    })
  } catch (error) {
    console.error("Error testing branded products:", error)
    return NextResponse.json({
      success: false,
      message: `Error al obtener productos con marca: ${error instanceof Error ? error.message : "Error desconocido"}`,
    })
  }
}

import { NextResponse } from "next/server"
import { getProductsFromZureo } from "@/lib/zureo-api"

export async function GET() {
  try {
    const allProducts = await getProductsFromZureo({ qty: 1000, includeInactive: true })

    // Filter products that have a brand assigned (marca.nombre != null)
    const brandedProducts = allProducts.filter(
      (product) => product.marca && product.marca.nombre && product.marca.nombre.trim() !== "",
    )

    return NextResponse.json({
      success: true,
      message: `${brandedProducts.length} productos con marca de ${allProducts.length} totales`,
      products: brandedProducts.map((product) => ({
        id: product.id,
        codigo: product.codigo,
        nombre: product.nombre,
        marca: {
          id: product.marca.id,
          nombre: product.marca.nombre,
        },
        stock: product.stock || 0,
        precio: product.precio || 0,
      })),
      data: {
        total: allProducts.length,
        withBrand: brandedProducts.length,
        withoutBrand: allProducts.length - brandedProducts.length,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error obteniendo productos con marca",
      details: { error: error instanceof Error ? error.message : "Error desconocido" },
    })
  }
}

import { NextResponse } from "next/server"
import { getProductsFromZureo } from "@/lib/zureo-api"

export async function POST(request: Request) {
  try {
    const { codes } = await request.json()

    if (!Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Se requiere un array de códigos",
      })
    }

    // Obtener todos los productos de Zureo
    const allProducts = await getProductsFromZureo({ qty: 5000, includeInactive: false })

    // Filtrar productos que coincidan con los códigos buscados
    const foundProducts = allProducts.filter((product) =>
      codes.some(
        (code) =>
          product.codigo.toLowerCase().includes(code.toLowerCase()) ||
          product.nombre?.toLowerCase().includes(code.toLowerCase()),
      ),
    )

    // Solo productos con marca
    const productsWithBrand = foundProducts.filter(
      (product) => product.marca && product.marca.nombre && product.marca.nombre.trim() !== "",
    )

    return NextResponse.json({
      success: true,
      message: `Se encontraron ${productsWithBrand.length} productos`,
      products: productsWithBrand.map((product) => ({
        id: product.id,
        codigo: product.codigo,
        nombre: product.nombre,
        marca: {
          nombre: product.marca.nombre,
        },
        precio: product.precio || 0,
        stock: product.stock || 0,
      })),
      searchedCodes: codes,
      totalFound: foundProducts.length,
      withBrand: productsWithBrand.length,
    })
  } catch (error) {
    console.error("Error searching products by codes:", error)
    return NextResponse.json({
      success: false,
      message: "Error al buscar productos",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

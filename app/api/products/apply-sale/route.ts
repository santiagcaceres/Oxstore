import { NextResponse } from "next/server"

// En una implementación real, aquí guardarías en tu base de datos
// Por ahora simulamos el guardado
let saleProducts: any[] = []

export async function POST(request: Request) {
  try {
    const { products } = await request.json()

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Se requiere un array de productos",
      })
    }

    // Simular guardado en base de datos
    saleProducts = products.map((product) => ({
      ...product,
      appliedAt: new Date().toISOString(),
      status: "active",
    }))

    // En una implementación real, aquí actualizarías tu base de datos
    // await updateProductsSaleStatus(products)

    return NextResponse.json({
      success: true,
      message: `Oferta aplicada a ${products.length} productos`,
      appliedProducts: saleProducts.length,
    })
  } catch (error) {
    console.error("Error applying sale:", error)
    return NextResponse.json({
      success: false,
      message: "Error al aplicar ofertas",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    saleProducts: saleProducts,
  })
}

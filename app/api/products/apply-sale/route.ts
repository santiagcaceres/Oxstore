import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { productCodes, discountPercentage } = await request.json()

    if (!productCodes || !Array.isArray(productCodes) || !discountPercentage) {
      return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 })
    }

    // En una implementación real, aquí actualizarías la base de datos
    // Por ahora, simulamos la operación
    console.log(`Aplicando ${discountPercentage}% de descuento a productos:`, productCodes)

    // Simular delay de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: `Oferta aplicada a ${productCodes.length} productos`,
      appliedTo: productCodes.length,
      discount: discountPercentage,
    })
  } catch (error) {
    console.error("Error applying sale:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

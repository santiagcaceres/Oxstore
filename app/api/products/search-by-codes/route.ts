import { type NextRequest, NextResponse } from "next/server"
import { getAllZureoProducts } from "@/lib/zureo-api"

export async function POST(request: NextRequest) {
  try {
    const { codes } = await request.json()

    if (!codes || !Array.isArray(codes)) {
      return NextResponse.json({ success: false, error: "Códigos inválidos" }, { status: 400 })
    }

    const allProducts = await getAllZureoProducts()

    const foundProducts = allProducts.filter(
      (product) => codes.includes(product.codigo) && product.marca?.nombre && product.stock > 0,
    )

    return NextResponse.json({
      success: true,
      products: foundProducts,
      found: foundProducts.length,
      searched: codes.length,
    })
  } catch (error) {
    console.error("Error searching products by codes:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

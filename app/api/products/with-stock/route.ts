import { NextResponse } from "next/server"
import { getProductsWithStock } from "@/lib/product-manager"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const products = await getProductsWithStock()

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    })
  } catch (error) {
    console.error("Error fetching products with stock:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching products with stock",
      },
      { status: 500 },
    )
  }
}

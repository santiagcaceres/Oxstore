import { NextResponse } from "next/server"
import { getCompleteProducts } from "@/lib/product-manager"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const products = await getCompleteProducts()

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    })
  } catch (error) {
    console.error("Error fetching complete products:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching complete products",
      },
      { status: 500 },
    )
  }
}

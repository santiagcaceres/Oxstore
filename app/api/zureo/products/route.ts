import { NextResponse } from "next/server"
import { zureoAPI } from "@/lib/zureo-api"

export async function GET() {
  try {
    console.log("[v0] GET /api/zureo/products - Starting request")

    const products = await zureoAPI.getAllProducts()

    console.log(`[v0] GET /api/zureo/products - Successfully fetched ${products.length} products`)

    return NextResponse.json({
      products,
      total: products.length,
      timestamp: new Date().toISOString(),
      endpoint: "https://api.zureo.com/sdk/v1/product/all",
      company: "1",
    })
  } catch (error) {
    console.error("[v0] GET /api/zureo/products - Error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al obtener productos de Zureo",
        timestamp: new Date().toISOString(),
        endpoint: "https://api.zureo.com/sdk/v1/product/all",
        company: "1",
      },
      { status: 500 },
    )
  }
}

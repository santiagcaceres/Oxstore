import { NextResponse } from "next/server"
import { ZureoAPI } from "@/lib/api"

export async function GET() {
  try {
    const zureoApi = new ZureoAPI()
    const products = await zureoApi.getAllProducts()

    return NextResponse.json({
      products,
      total: products.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching Zureo products:", error)
    return NextResponse.json({ error: "Error al obtener productos de Zureo" }, { status: 500 })
  }
}

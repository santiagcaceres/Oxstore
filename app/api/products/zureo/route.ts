import { NextResponse } from "next/server"
import { getProductsFromZureo } from "@/lib/zureo-api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const products = await getProductsFromZureo()
    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error("Error fetching products from Zureo:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}

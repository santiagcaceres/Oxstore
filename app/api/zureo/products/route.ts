import { NextResponse } from "next/server"
import { getProductsFromZureo } from "@/lib/zureo-api"

export async function GET() {
  try {
    const products = await getProductsFromZureo({ qty: 1000, includeInactive: true })
    return NextResponse.json(products)
  } catch (error) {
    console.warn("Error fetching Zureo products:", error)
    return NextResponse.json([]) // Return empty array instead of error
  }
}

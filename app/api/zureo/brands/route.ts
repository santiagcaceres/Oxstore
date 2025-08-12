import { NextResponse } from "next/server"
import { getBrandsFromZureo } from "@/lib/zureo-api"

export async function GET() {
  try {
    const brands = await getBrandsFromZureo()

    // Transformar datos para incluir información adicional
    const transformedBrands = brands.map((brand: any) => ({
      id: brand.id || brand.name,
      name: brand.name,
      description: brand.description || "",
      active: brand.active !== false,
      productCount: brand.productCount || 0,
    }))

    return NextResponse.json(transformedBrands)
  } catch (error) {
    console.error("Error fetching brands from Zureo:", error)
    return NextResponse.json({ error: "Error fetching brands from Zureo API" }, { status: 500 })
  }
}

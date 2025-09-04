import { NextResponse } from "next/server"
import { zureoAPI } from "@/lib/zureo-api"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("[v0] GET /api/zureo/brands - Starting request")

    const brands = await zureoAPI.getBrands()

    console.log(`[v0] GET /api/zureo/brands - Successfully fetched ${brands.length} brands`)

    return NextResponse.json({
      success: true,
      brands: brands.map((brand) => ({
        id: brand.id,
        nombre: brand.nombre,
        slug: brand.nombre
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, ""),
      })),
      timestamp: new Date().toISOString(),
      endpoint: "https://api.zureo.com/sdk/v1/brand/all",
    })
  } catch (error) {
    console.error("[v0] GET /api/zureo/brands - Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener marcas",
        timestamp: new Date().toISOString(),
        endpoint: "https://api.zureo.com/sdk/v1/brand/all",
      },
      { status: 500 },
    )
  }
}

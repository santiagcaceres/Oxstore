import { NextResponse } from "next/server"
import { zureoAPI } from "@/lib/zureo-api"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = 20

    console.log(`[v0] GET /api/zureo/brands/${params.slug}/products - Starting request (page: ${page})`)

    // Convertir slug a nombre de marca
    const brandName = params.slug.replace(/-/g, " ")

    const allProducts = await zureoAPI.getAllProducts()
    const brandProducts = allProducts.filter((product) =>
      product.marca.nombre.toLowerCase().includes(brandName.toLowerCase()),
    )

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = brandProducts.slice(startIndex, endIndex)

    console.log(
      `[v0] GET /api/zureo/brands/${params.slug}/products - Found ${brandProducts.length} products for brand "${brandName}"`,
    )

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      currentPage: page,
      totalPages: Math.ceil(brandProducts.length / limit),
      totalProducts: brandProducts.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[v0] GET /api/zureo/brands/${params.slug}/products - Error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener productos de la marca",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

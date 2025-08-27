import { NextResponse } from "next/server"
import { ZureoAPI } from "@/lib/api"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = 20

    const zureoAPI = new ZureoAPI()

    // Convertir slug a nombre de marca
    const brandName = params.slug.replace(/-/g, " ")

    // Obtener productos filtrados por marca
    const products = await zureoAPI.getProductsByBrand(brandName, page, limit)

    return NextResponse.json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(products.length / limit),
    })
  } catch (error) {
    console.error("Error fetching brand products:", error)
    return NextResponse.json({ success: false, error: "Error al obtener productos de la marca" }, { status: 500 })
  }
}

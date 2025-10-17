import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ products: [] })
    }

    const supabase = createClient()
    const searchTerm = query.toLowerCase().trim()

    console.log("[v0] Searching all products for:", searchTerm)

    const { data: productsData, error } = await supabase
      .from("products_in_stock")
      .select("id, name, brand, price, image_url, zureo_code, description, category, subcategory")
      .or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,zureo_code.ilike.%${searchTerm}%`,
      )
      .gt("stock_quantity", 0)
      .eq("is_active", true)
      .order("name")
      .limit(limit)

    if (error) {
      console.error("[v0] Error searching products:", error)
      return NextResponse.json({ error: "Error al buscar productos" }, { status: 500 })
    }

    const uniqueProducts = productsData?.reduce((acc: any[], product) => {
      if (!acc.find((p) => p.zureo_code === product.zureo_code)) {
        acc.push(product)
      }
      return acc
    }, [])

    console.log("[v0] Found", uniqueProducts?.length || 0, "unique products")

    return NextResponse.json({ products: uniqueProducts || [] })
  } catch (error) {
    console.error("[v0] Error in search API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = searchParams.get("limit") || "12"
    const offset = searchParams.get("offset") || "0"

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    let query = supabase
      .from("products_in_stock")
      .select("*")
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .neq("name", "Producto sin nombre")
      .neq("custom_name", "Producto sin nombre")
      .order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    const { data: products, error } = await query.range(
      Number.parseInt(offset),
      Number.parseInt(offset) + Number.parseInt(limit) - 1,
    )

    if (error) {
      console.error("Error loading products:", error)
      return NextResponse.json({ error: "Error al cargar productos" }, { status: 500 })
    }

    const filteredProducts = products?.filter((product) => {
      const productName = product.custom_name || product.name
      return productName !== "Producto sin nombre"
    })

    const transformedProducts =
      filteredProducts?.map((product) => ({
        id: product.id,
        name: product.custom_name || product.name,
        description: product.local_description || product.description,
        price: product.price || 0, // Usar directamente el precio calculado desde la sincronización
        compare_price: product.compare_price,
        stock_quantity: product.stock_quantity,
        sku: product.zureo_code || product.sku,
        brand: product.brand,
        category: product.category,
        is_featured: product.is_featured,
        slug: `${product.id}-${
          (product.custom_name || product.name)
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || "producto"
        }`,
        color: product.color,
        size: product.size,
        images: product.local_images
          ? product.local_images.map((url: string, index: number) => ({
              id: index + 1,
              image_url: url,
              alt_text: product.name,
            }))
          : [
              {
                id: 1,
                image_url:
                  product.image_url ||
                  `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(product.name)}`,
                alt_text: product.name,
              },
            ],
      })) || []

    return NextResponse.json({
      products: transformedProducts,
      total: transformedProducts.length,
    })
  } catch (error) {
    console.error("Error in products API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

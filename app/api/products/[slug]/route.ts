import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    console.log(`[v0] GET /api/products/${params.slug} - Starting request`)

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const slugParts = params.slug.split("-")
    const productId = slugParts[0]

    if (!productId || isNaN(Number(productId))) {
      console.log(`[v0] GET /api/products/${params.slug} - Invalid slug format`)
      return NextResponse.json({ error: "Formato de slug inválido" }, { status: 400 })
    }

    const { data: product, error } = await supabase.from("products_in_stock").select("*").eq("id", productId).single()

    if (error || !product) {
      console.log(`[v0] GET /api/products/${params.slug} - Product not found`)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log(`[v0] GET /api/products/${params.slug} - Product found: ${product.name}`)

    const transformedProduct = {
      id: product.id,
      name: product.custom_name || product.name,
      description: product.local_description || product.description,
      price: product.local_price || product.price,
      compare_price: product.compare_price || product.price * 1.2,
      stock_quantity: product.stock_quantity,
      sku: product.zureo_code || product.sku,
      brand: product.brand,
      category: product.category,
      is_featured: product.is_featured,
      slug: params.slug,
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
                product.image_url || `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.name)}`,
              alt_text: product.name,
            },
          ],
      weight: product.weight,
      dimensions: product.dimensions,
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error(`[v0] GET /api/products/${params.slug} - Error:`, error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al obtener producto",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

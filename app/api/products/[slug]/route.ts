import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    console.log(`[v0] GET /api/products/${params.slug} - Starting request`)

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const slugParts = params.slug.split("-")
    const productId = slugParts[0]

    let product = null
    let error = null

    // Primero intentar buscar por ID si es numérico
    if (productId && !isNaN(Number(productId))) {
      const result = await supabase.from("products_in_stock").select("*").eq("id", productId).single()
      product = result.data
      error = result.error
    }

    // Si no se encuentra por ID, intentar buscar por nombre similar
    if (!product) {
      console.log(`[v0] Product not found by ID, trying name search for: ${params.slug}`)

      // Extraer el nombre del slug (todo después del primer guión)
      const nameFromSlug = slugParts.slice(1).join("-").replace(/-/g, " ")

      if (nameFromSlug) {
        const { data: products, error: searchError } = await supabase
          .from("products_in_stock")
          .select("*")
          .or(`custom_name.ilike.%${nameFromSlug}%,name.ilike.%${nameFromSlug}%`)
          .gt("stock_quantity", 0)
          .limit(1)

        if (products && products.length > 0) {
          product = products[0]
          error = null
          console.log(`[v0] Found product by name search: ${product.custom_name || product.name}`)
        } else {
          error = searchError
        }
      }
    }

    // Si aún no se encuentra, intentar buscar solo por ID numérico sin validar formato
    if (!product && productId) {
      const { data: fallbackProduct, error: fallbackError } = await supabase
        .from("products_in_stock")
        .select("*")
        .eq("id", productId)
        .single()

      if (fallbackProduct) {
        product = fallbackProduct
        error = null
        console.log(`[v0] Found product by fallback ID search: ${fallbackProduct.custom_name || fallbackProduct.name}`)
      }
    }

    if (error || !product) {
      console.log(`[v0] GET /api/products/${params.slug} - Product not found after all attempts`)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const productName = product.custom_name || product.name

    if (!productName || productName.trim() === "") {
      console.log(`[v0] GET /api/products/${params.slug} - Product has empty name`)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log(`[v0] Loading variants for zureo_code: ${product.zureo_code}`)

    const { data: variants, error: variantsError } = await supabase
      .from("products_in_stock")
      .select("id, color, size, stock_quantity, price, custom_name, name, zureo_code")
      .eq("zureo_code", product.zureo_code)
      .gt("stock_quantity", 0)

    if (variantsError) {
      console.error(`[v0] Error loading variants:`, variantsError)
    } else {
      console.log(`[v0] Loaded ${variants?.length || 0} variants for product ${product.zureo_code}`)
      console.log(`[v0] Variants data:`, variants)

      variants?.forEach((variant, index) => {
        console.log(
          `[v0] Variant ${index + 1}: ID=${variant.id}, Color=${variant.color}, Size=${variant.size}, Stock=${variant.stock_quantity}`,
        )
      })
    }

    console.log(`[v0] GET /api/products/${params.slug} - Product found: ${productName}`)

    const productImages = product.product_images

    const transformedProduct = {
      id: product.id,
      name: productName,
      description: product.local_description || product.description,
      price: product.local_price || product.price,
      compare_price: product.compare_price || product.price * 1.2,
      stock_quantity: product.stock_quantity,
      sku: product.zureo_code || product.sku,
      brand: product.brand,
      category: product.category,
      is_featured: product.is_featured,
      slug: params.slug,
      color: product.color,
      size: product.size,
      zureo_data: product.zureo_data,
      variants: variants || [],
      images:
        productImages?.length > 0
          ? productImages.map((img: any, index: number) => ({
              id: index + 1,
              image_url: img.image_url,
              alt_text: productName,
            }))
          : [
              {
                id: 1,
                image_url:
                  product.image_url || `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(productName)}`,
                alt_text: productName,
              },
            ],
      weight: product.weight,
      dimensions: product.dimensions,
    }

    console.log(`[v0] Transformed product variants count: ${transformedProduct.variants.length}`)
    console.log(
      `[v0] Available colors: ${transformedProduct.variants
        .map((v) => v.color)
        .filter(Boolean)
        .join(", ")}`,
    )
    console.log(
      `[v0] Available sizes: ${transformedProduct.variants
        .map((v) => v.size)
        .filter(Boolean)
        .join(", ")}`,
    )

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

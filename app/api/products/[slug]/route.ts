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

    if (productId && !isNaN(Number(productId))) {
      const result = await supabase.from("products_in_stock").select("*").eq("id", productId).single()
      product = result.data
      error = result.error
    }

    if (!product) {
      console.log(`[v0] Product not found by ID, trying name search for: ${params.slug}`)

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

    if (error || !product) {
      console.log(`[v0] GET /api/products/${params.slug} - Product not found after all attempts`)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const productName = product.custom_name || product.name

    if (!productName || productName.trim() === "") {
      console.log(`[v0] GET /api/products/${params.slug} - Product has empty name`)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log(`[v0] Loading images for product_id: ${product.id}`)
    const { data: productImages, error: imagesError } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true })

    if (imagesError) {
      console.error(`[v0] Error loading product images:`, imagesError)
    }

    console.log(`[v0] Found ${productImages?.length || 0} images in product_images table`)

    let images = []
    if (productImages && productImages.length > 0) {
      images = productImages.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text || productName,
        is_primary: img.is_primary || false,
      }))
      console.log(`[v0] Using ${images.length} images from product_images table`)
    } else if (product.image_url) {
      images = [
        {
          id: 1,
          image_url: product.image_url,
          alt_text: productName,
          is_primary: true,
        },
      ]
      console.log(`[v0] Using single image from products_in_stock.image_url`)
    } else {
      images = [
        {
          id: 1,
          image_url: `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(productName)}`,
          alt_text: productName,
          is_primary: true,
        },
      ]
      console.log(`[v0] Using placeholder image`)
    }

    console.log(`[v0] Loading variants from products_in_stock for zureo_code: ${product.zureo_code}`)

    const { data: variants, error: variantsError } = await supabase
      .from("products_in_stock")
      .select("*")
      .eq("zureo_code", product.zureo_code)
      .gt("stock_quantity", 0)
      .order("color", { ascending: true })
      .order("size", { ascending: true })

    if (variantsError) {
      console.error(`[v0] Error loading variants:`, variantsError)
    }

    console.log(`[v0] Found ${variants?.length || 0} variants with same zureo_code`)

    let processedVariants = []

    if (variants && variants.length > 0) {
      processedVariants = variants.map((variant: any) => ({
        id: variant.id,
        color: variant.color || null,
        size: variant.size || null,
        stock_quantity: variant.stock_quantity,
        price: variant.price,
        custom_name: variant.custom_name || variant.name,
        name: variant.custom_name || variant.name,
        zureo_code: variant.zureo_code,
        variety_name:
          `${variant.color ? `Color: ${variant.color}` : ""} ${variant.size ? `Talle: ${variant.size}` : ""}`.trim() ||
          "Estándar",
        image_url: variant.image_url,
      }))

      console.log(`[v0] Processed ${processedVariants.length} variants from products_in_stock`)
    } else {
      console.log(`[v0] No variants found, creating basic variant`)
      processedVariants = [
        {
          id: product.id,
          color: product.color || null,
          size: product.size || null,
          stock_quantity: product.stock_quantity,
          price: product.price,
          custom_name: product.custom_name || product.name,
          name: productName,
          zureo_code: product.zureo_code,
          variety_name: "Estándar",
          image_url: product.image_url,
        },
      ]
    }

    console.log(`[v0] GET /api/products/${params.slug} - Product found: ${productName}`)

    const allImagesByColor: { [key: string]: any[] } = {}

    // Obtener todos los product_ids de las variantes del mismo zureo_code
    const variantIds = variants?.map((v: any) => v.id) || []

    if (variantIds.length > 0) {
      const { data: allVariantImages, error: allImagesError } = await supabase
        .from("product_images")
        .select("*")
        .in("product_id", variantIds)
        .order("sort_order", { ascending: true })

      if (allImagesError) {
        console.error(`[v0] Error loading all variant images:`, allImagesError)
      } else if (allVariantImages && allVariantImages.length > 0) {
        // Agrupar imágenes por color
        variants?.forEach((variant: any) => {
          if (variant.color) {
            const variantImages = allVariantImages
              .filter((img: any) => img.product_id === variant.id)
              .map((img: any) => ({
                id: img.id,
                image_url: img.image_url,
                alt_text: img.alt_text || productName,
                is_primary: img.is_primary || false,
              }))

            if (variantImages.length > 0) {
              allImagesByColor[variant.color] = variantImages
              console.log(`[v0] Loaded ${variantImages.length} images for color: ${variant.color}`)
            }
          }
        })
      }
    }

    const transformedProduct = {
      id: product.id,
      name: productName,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      sku: product.zureo_code || product.sku,
      brand: product.brand,
      category: product.category,
      is_featured: product.is_featured,
      slug: params.slug,
      color: product.color,
      size: product.size,
      zureo_code: product.zureo_code,
      variants: processedVariants,
      allImagesByColor: allImagesByColor, // Enviar todas las imágenes por color
      images: images,
      weight: product.weight,
      dimensions: product.dimensions,
    }

    console.log(`[v0] Transformed product with ${transformedProduct.images.length} default images`)
    console.log(`[v0] Images by color: ${Object.keys(allImagesByColor).length} colors`)
    console.log(`[v0] Transformed product variants count: ${transformedProduct.variants.length}`)

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

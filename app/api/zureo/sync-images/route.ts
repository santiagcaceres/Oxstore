import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { zureoAPI } from "@/lib/zureo-api"

export const dynamic = "force-dynamic"
export const maxDuration = 300 // 5 minutes

async function base64ToBlob(base64: string, contentType = "image/jpeg"): Promise<Blob> {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: contentType })
}

export async function POST(request: Request) {
  console.log("[v0] ========================================")
  console.log("[v0] INICIANDO SINCRONIZACIÓN DE IMÁGENES")
  console.log("[v0] ========================================")

  try {
    const { limit = 50 } = await request.json().catch(() => ({}))

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    console.log("[v0] Buscando productos con placeholders...")
    const { data: productsWithPlaceholders, error: fetchError } = await supabase
      .from("products_in_stock")
      .select("id, zureo_id, zureo_variety_id, zureo_code, name, image_url")
      .like("image_url", "%placeholder.svg%")
      .not("zureo_id", "is", null)
      .limit(limit)

    if (fetchError) {
      console.error("[v0] Error fetching products:", fetchError)
      throw fetchError
    }

    console.log(`[v0] Encontrados ${productsWithPlaceholders?.length || 0} productos con placeholders`)

    if (!productsWithPlaceholders || productsWithPlaceholders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay productos con placeholders para sincronizar",
        processed: 0,
        successful: 0,
        failed: 0,
      })
    }

    let successful = 0
    let failed = 0
    const errors: Array<{ productId: number; error: string }> = []

    for (const product of productsWithPlaceholders) {
      try {
        console.log(`[v0] Procesando producto ${product.id} (${product.name})...`)
        console.log(`[v0] - Zureo ID: ${product.zureo_id}`)
        console.log(`[v0] - Variety ID: ${product.zureo_variety_id}`)

        const images = await zureoAPI.getProductImages(
          Number.parseInt(product.zureo_id),
          product.zureo_variety_id ? Number.parseInt(product.zureo_variety_id) : undefined,
        )

        if (!images || images.length === 0) {
          console.log(`[v0] No se encontraron imágenes para el producto ${product.id}`)
          failed++
          errors.push({ productId: product.id, error: "No images found in Zureo" })
          continue
        }

        console.log(`[v0] Encontradas ${images.length} imágenes para el producto ${product.id}`)

        const uploadedUrls: string[] = []

        for (let i = 0; i < images.length; i++) {
          const image = images[i]

          try {
            // Convert base64 to blob
            const blob = await base64ToBlob(image.base64)

            // Generate unique filename
            const fileExt = image.filename?.split(".").pop() || "jpg"
            const fileName = `product-${product.zureo_code}-${product.zureo_variety_id || "main"}-${Date.now()}-${i}.${fileExt}`
            const filePath = `products/${fileName}`

            console.log(`[v0] Subiendo imagen ${i + 1}/${images.length}: ${filePath}`)

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("product-images")
              .upload(filePath, blob, {
                contentType: "image/jpeg",
                cacheControl: "3600",
                upsert: false,
              })

            if (uploadError) {
              console.error(`[v0] Error subiendo imagen ${i + 1}:`, uploadError)
              continue
            }

            // Get public URL
            const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath)

            uploadedUrls.push(urlData.publicUrl)
            console.log(`[v0] Imagen ${i + 1} subida exitosamente: ${urlData.publicUrl}`)
          } catch (imageError) {
            console.error(`[v0] Error procesando imagen ${i + 1}:`, imageError)
          }
        }

        if (uploadedUrls.length === 0) {
          console.log(`[v0] No se pudieron subir imágenes para el producto ${product.id}`)
          failed++
          errors.push({ productId: product.id, error: "Failed to upload images" })
          continue
        }

        const { error: updateError } = await supabase
          .from("products_in_stock")
          .update({
            image_url: uploadedUrls[0],
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id)

        if (updateError) {
          console.error(`[v0] Error actualizando producto ${product.id}:`, updateError)
          failed++
          errors.push({ productId: product.id, error: updateError.message })
          continue
        }

        const imageInserts = uploadedUrls.map((url, index) => ({
          product_id: product.id,
          image_url: url,
          sort_order: index,
          is_primary: index === 0,
          alt_text: `${product.name} - Imagen ${index + 1}`,
        }))

        // Delete existing placeholder images first
        await supabase.from("product_images").delete().eq("product_id", product.id)

        const { error: imagesError } = await supabase.from("product_images").insert(imageInserts)

        if (imagesError) {
          console.error(`[v0] Error insertando imágenes en product_images:`, imagesError)
          // Don't fail the entire operation
        }

        console.log(`[v0] ✓ Producto ${product.id} actualizado con ${uploadedUrls.length} imágenes`)
        successful++

        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (productError) {
        console.error(`[v0] Error procesando producto ${product.id}:`, productError)
        failed++
        errors.push({
          productId: product.id,
          error: productError instanceof Error ? productError.message : "Unknown error",
        })
      }
    }

    console.log("[v0] ========================================")
    console.log("[v0] SINCRONIZACIÓN DE IMÁGENES COMPLETADA")
    console.log(`[v0] Procesados: ${productsWithPlaceholders.length}`)
    console.log(`[v0] Exitosos: ${successful}`)
    console.log(`[v0] Fallidos: ${failed}`)
    console.log("[v0] ========================================")

    return NextResponse.json({
      success: true,
      processed: productsWithPlaceholders.length,
      successful,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("[v0] Error crítico en sincronización de imágenes:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

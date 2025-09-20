import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const { data: product, error } = await supabase.from("products_in_stock").select("*").eq("id", params.id).single()

    if (error || !product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const body = await request.json()
    console.log("[v0] Received body for product update:", body)

    const {
      custom_name,
      local_description,
      local_price,
      local_images,
      is_featured,
      brand,
      category,
      subcategory,
      sale_price,
      discount_percentage,
      gender,
    } = body

    const updateData: any = {}

    if (custom_name !== undefined) updateData.name = custom_name
    if (local_description !== undefined) updateData.description = local_description
    if (local_price !== undefined) updateData.price = local_price
    if (local_images !== undefined && local_images.length > 0) updateData.image_url = local_images[0]
    if (is_featured !== undefined) updateData.is_featured = is_featured
    if (brand !== undefined) updateData.brand = brand
    if (category !== undefined) updateData.category = category
    if (subcategory !== undefined) updateData.subcategory = subcategory
    if (sale_price !== undefined) updateData.sale_price = sale_price
    if (discount_percentage !== undefined) updateData.discount_percentage = discount_percentage
    if (gender !== undefined) updateData.gender = gender

    updateData.updated_at = new Date().toISOString()

    console.log("[v0] Update data being sent to database:", updateData)

    const { data, error } = await supabase
      .from("products_in_stock")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar producto en products_in_stock:", error)
      return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
    }

    if (data?.zureo_id) {
      const { error: productsError } = await supabase.from("products").update(updateData).eq("zureo_id", data.zureo_id)

      if (productsError) {
        console.error("Error al actualizar producto en products:", productsError)
        // Don't fail the entire operation, just log the error
      } else {
        console.log("[v0] Product updated successfully in both tables")
      }
    }

    console.log("[v0] Product updated successfully:", data)

    if (local_images && Array.isArray(local_images) && local_images.length > 0) {
      // Eliminar imágenes existentes
      await supabase.from("product_images").delete().eq("product_id", params.id)

      // Insertar nuevas imágenes
      const imageInserts = local_images.map((imageUrl: string, index: number) => ({
        product_id: Number.parseInt(params.id),
        image_url: imageUrl,
        sort_order: index,
        is_primary: index === 0, // La primera imagen es la principal
        alt_text: data.name || "Imagen del producto",
      }))

      const { error: imagesError } = await supabase.from("product_images").insert(imageInserts)

      if (imagesError) {
        console.error("Error al actualizar imágenes:", imagesError)
        // No fallar la actualización del producto por errores de imágenes
      } else {
        console.log("[v0] Product images updated successfully")
      }
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

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

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Only add fields that are explicitly provided
    if (custom_name !== undefined && custom_name !== null) {
      updateData.custom_name = custom_name
      updateData.name = custom_name // Also update name for display
    }
    if (local_description !== undefined && local_description !== null) {
      updateData.custom_description = local_description
      updateData.description = local_description // Also update description for display
    }
    if (local_price !== undefined && local_price !== null) {
      updateData.price = Number.parseInt(local_price.toString())
    }
    if (local_images !== undefined && local_images !== null && Array.isArray(local_images) && local_images.length > 0) {
      updateData.image_url = local_images[0]
    }
    if (is_featured !== undefined && is_featured !== null) {
      updateData.is_featured = is_featured
    }
    if (brand !== undefined && brand !== null && brand !== "") {
      updateData.brand = brand
    }
    if (category !== undefined && category !== null && category !== "") {
      updateData.category = category
    }
    if (subcategory !== undefined && subcategory !== null && subcategory !== "") {
      updateData.subcategory = subcategory
    }
    if (gender !== undefined && gender !== null && gender !== "") {
      updateData.gender = gender
    }
    if (sale_price !== undefined && sale_price !== null && sale_price !== "") {
      updateData.sale_price = Number.parseFloat(sale_price.toString())
    } else if (sale_price === null || sale_price === "") {
      updateData.sale_price = null
    }
    if (discount_percentage !== undefined && discount_percentage !== null && discount_percentage !== "") {
      updateData.discount_percentage = Number.parseInt(discount_percentage.toString())
    } else if (discount_percentage === null || discount_percentage === "") {
      updateData.discount_percentage = null
    }

    console.log("[v0] Update data being sent to database:", updateData)

    const { data, error } = await supabase
      .from("products_in_stock")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating products_in_stock:", error)
      return NextResponse.json(
        {
          error: "Error al actualizar producto",
          details: error.message,
          hint: error.hint,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Product updated successfully in products_in_stock:", data)

    if (data?.zureo_code) {
      const variantUpdateData: any = {}

      // Only update fields that make sense for all variants
      if (custom_name !== undefined && custom_name !== null) {
        variantUpdateData.custom_name = custom_name
        variantUpdateData.name = custom_name
      }
      if (local_description !== undefined && local_description !== null) {
        variantUpdateData.custom_description = local_description
        variantUpdateData.description = local_description
      }
      if (is_featured !== undefined && is_featured !== null) {
        variantUpdateData.is_featured = is_featured
      }
      if (brand !== undefined && brand !== null && brand !== "") {
        variantUpdateData.brand = brand
      }
      if (category !== undefined && category !== null && category !== "") {
        variantUpdateData.category = category
      }
      if (subcategory !== undefined && subcategory !== null && subcategory !== "") {
        variantUpdateData.subcategory = subcategory
      }
      if (gender !== undefined && gender !== null && gender !== "") {
        variantUpdateData.gender = gender
      }

      if (Object.keys(variantUpdateData).length > 0) {
        variantUpdateData.updated_at = new Date().toISOString()

        const { error: variantsError } = await supabase
          .from("products_in_stock")
          .update(variantUpdateData)
          .eq("zureo_code", data.zureo_code)
          .neq("id", params.id) // Don't update the current product again

        if (variantsError) {
          console.error("[v0] Error updating variants:", variantsError)
          // Don't fail the entire operation
        } else {
          console.log("[v0] All variants updated successfully")
        }
      }
    }

    if (local_images && Array.isArray(local_images) && local_images.length > 0) {
      // Delete existing images
      await supabase.from("product_images").delete().eq("product_id", params.id)

      // Insert new images
      const imageInserts = local_images.map((imageUrl: string, index: number) => ({
        product_id: Number.parseInt(params.id),
        image_url: imageUrl,
        sort_order: index,
        is_primary: index === 0,
        alt_text: data.custom_name || data.name || "Imagen del producto",
      }))

      const { error: imagesError } = await supabase.from("product_images").insert(imageInserts)

      if (imagesError) {
        console.error("[v0] Error updating images:", imagesError)
        // Don't fail the entire operation
      } else {
        console.log("[v0] Product images updated successfully")
      }
    }

    return NextResponse.json({
      success: true,
      product: data,
      message: "Producto actualizado correctamente",
    })
  } catch (error) {
    console.error("[v0] Exception in PATCH handler:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`[v0] GET /api/zureo/products/${params.id} - Starting request`)

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: product, error } = await supabase.from("products").select("*").eq("id", params.id).single()

    if (error || !product) {
      console.log(`[v0] GET /api/zureo/products/${params.id} - Product not found`)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log(`[v0] GET /api/zureo/products/${params.id} - Product found: ${product.name}`)

    return NextResponse.json({
      product,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[v0] GET /api/zureo/products/${params.id} - Error:`, error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al obtener producto",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { local_images, local_description, local_price, is_featured, custom_name } = body

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (local_images !== undefined) updateData.image_url = local_images[0] || updateData.image_url
    if (local_description !== undefined) updateData.description = local_description
    if (local_price !== undefined) updateData.price = local_price
    if (is_featured !== undefined) updateData.is_featured = is_featured
    if (custom_name !== undefined) updateData.name = custom_name

    const { error } = await supabase.from("products").update(updateData).eq("id", params.id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      message: "Configuración local guardada correctamente",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`[v0] GET /api/admin/orders/${params.id} - Starting request`)
    const supabase = createClient()

    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", params.id).single()

    if (orderError || !order) {
      console.error("[v0] Error loading order:", orderError)
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", params.id)

    if (itemsError) {
      console.error("[v0] Error loading order items:", itemsError)
      return NextResponse.json({ error: "Error al cargar items del pedido" }, { status: 500 })
    }

    const itemsWithProducts = await Promise.all(
      (orderItems || []).map(async (item) => {
        const { data: product } = await supabase
          .from("products_in_stock")
          .select("name, image_url, brand")
          .eq("id", item.product_id)
          .single()

        return {
          ...item,
          products_in_stock: product || null,
        }
      }),
    )

    const orderWithItems = {
      ...order,
      order_items: itemsWithProducts,
    }

    console.log(`[v0] Returning order ${params.id} with ${itemsWithProducts.length} items`)
    return NextResponse.json({ order: orderWithItems })
  } catch (error) {
    console.error("[v0] Error in GET /api/admin/orders/[id]:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[v0] GET /api/admin/orders - Starting request")
    const supabase = createClient()

    console.log("[v0] Querying orders table")

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("[v0] Error loading orders:", ordersError)
      return NextResponse.json({ error: "Error al cargar pedidos: " + ordersError.message }, { status: 500 })
    }

    console.log(`[v0] Loaded ${orders?.length || 0} orders`)

    if (!orders || orders.length === 0) {
      return NextResponse.json({ orders: [] })
    }

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id)

        if (itemsError) {
          console.error(`[v0] Error loading items for order ${order.id}:`, itemsError)
          return {
            ...order,
            order_items: [],
          }
        }

        const itemsWithProducts = await Promise.all(
          (items || []).map(async (item) => {
            const { data: product, error: productError } = await supabase
              .from("products_in_stock")
              .select("name, image_url, brand")
              .eq("id", item.product_id)
              .single()

            if (productError) {
              console.error(`[v0] Error loading product ${item.product_id}:`, productError)
              return {
                ...item,
                products_in_stock: null,
              }
            }

            return {
              ...item,
              products_in_stock: product,
            }
          }),
        )

        return {
          ...order,
          order_items: itemsWithProducts,
        }
      }),
    )

    console.log(`[v0] Returning ${ordersWithItems.length} orders with items`)
    return NextResponse.json({ orders: ordersWithItems })
  } catch (error) {
    console.error("[v0] Error in GET /api/admin/orders:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

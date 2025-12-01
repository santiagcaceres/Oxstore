import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          price,
          total_price,
          total,
          size,
          color
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching order:", error)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Transform the data to match the expected format
    const transformedOrder = {
      id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      shipping_address: order.shipping_address,
      shipping_method: order.shipping_method,
      shipping_cost: order.shipping_cost,
      created_at: order.created_at,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      payment_method: order.payment_method,
      items: order.order_items || [],
    }

    return NextResponse.json(transformedOrder)
  } catch (error) {
    console.error("Error in GET /api/orders/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

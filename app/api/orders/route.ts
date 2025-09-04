import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body = await request.json()

    console.log("[v0] Creating order with data:", body)

    const orderData = {
      order_number: `ORD-${Date.now()}`,
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      customer_phone: body.customerPhone,
      customer_dni: body.customerDni || null,
      total_amount: Number.parseFloat(body.totalAmount),
      payment_method: body.paymentMethod || "cash",
      payment_status: body.paymentMethod === "cash" ? "pending" : "paid",
      order_status: "pending", // Added missing order_status field
      shipping_method: body.shippingMethod || "pickup",
      shipping_cost: body.shippingMethod === "delivery" ? 250 : 0,
      shipping_address: body.shippingAddress || null,
      billing_address: body.billingAddress || body.shippingAddress || null,
      status: "pending",
      user_id: 1, // Usuario invitado por defecto
      notes: body.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("[v0] Order data to insert:", orderData)

    const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

    if (orderError) {
      console.error("[v0] Error creating order:", orderError)
      return NextResponse.json({ error: `Error al crear la orden: ${orderError.message}` }, { status: 500 })
    }

    console.log("[v0] Order created successfully:", order)

    if (body.items && body.items.length > 0) {
      const orderItems = body.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: Number.parseFloat(item.price),
        total: Number.parseFloat(item.price) * item.quantity,
        product_image: item.image || item.image_url || "/placeholder.svg?height=100&width=100",
        created_at: new Date().toISOString(),
      }))

      console.log("[v0] Order items to insert:", orderItems)

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("[v0] Error creating order items:", itemsError)
        return NextResponse.json(
          { error: `Error al crear los items de la orden: ${itemsError.message}` },
          { status: 500 },
        )
      }

      console.log("[v0] Order items created successfully")
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("[v0] Error in POST /api/orders:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

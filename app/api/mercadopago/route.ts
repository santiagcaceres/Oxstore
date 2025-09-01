import { type NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, customerInfo, shippingCost = 0, shippingMethod = "pickup" } = body

    const orderNumber = `ORD-${Date.now()}`
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const totalAmount = subtotal + shippingCost

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_email: customerInfo.email,
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customer_phone: customerInfo.phone,
        shipping_address:
          shippingMethod === "delivery"
            ? `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.postalCode}`
            : "Retiro en sucursal",
        total_amount: totalAmount,
        shipping_cost: shippingCost,
        shipping_method: shippingMethod,
        payment_method: "mercadopago",
        payment_status: "pending",
        order_status: "pending",
        notes: `Método de entrega: ${shippingMethod === "pickup" ? "Retiro en sucursal" : "Envío a domicilio"}`,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Error creating order" }, { status: 500 })
    }

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      size: item.size,
      color: item.color,
    }))

    await supabase.from("order_items").insert(orderItems)

    const preference = new Preference(client)

    const mercadoPagoItems = items.map((item: any) => ({
      title: item.name,
      unit_price: item.price,
      quantity: item.quantity,
    }))

    // Agregar costo de envío como item separado si aplica
    if (shippingCost > 0) {
      mercadoPagoItems.push({
        title: "Envío a domicilio",
        unit_price: shippingCost,
        quantity: 1,
      })
    }

    const result = await preference.create({
      body: {
        items: mercadoPagoItems,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?order_id=${order.id}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure?order_id=${order.id}`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/pending?order_id=${order.id}`,
        },
        auto_return: "approved",
        external_reference: orderNumber,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`,
        payer: {
          name: customerInfo.firstName,
          surname: customerInfo.lastName,
          email: customerInfo.email,
          phone: {
            number: customerInfo.phone,
          },
        },
      },
    })

    return NextResponse.json({ id: result.id, orderNumber, orderId: order.id })
  } catch (error) {
    console.error("Error creating preference:", error)
    return NextResponse.json({ error: "Error creating preference" }, { status: 500 })
  }
}

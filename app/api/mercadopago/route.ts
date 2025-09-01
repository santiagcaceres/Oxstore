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
    const { title, price, quantity, cartItems, customerInfo } = body

    const orderNumber = `ORD-${Date.now()}`
    const totalAmount = cartItems
      ? cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
      : price * quantity

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        total_amount: totalAmount,
        status: "pending",
        payment_status: "pending",
        payment_method: "mercadopago",
        shipping_address: customerInfo?.address || "",
        billing_address: customerInfo?.address || "",
        notes: customerInfo
          ? `Cliente: ${customerInfo.name} - Email: ${customerInfo.email} - Teléfono: ${customerInfo.phone}`
          : "",
      })
      .select()
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Error creating order" }, { status: 500 })
    }

    if (cartItems && cartItems.length > 0) {
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }))

      await supabase.from("order_items").insert(orderItems)
    }

    const preference = new Preference(client)

    const items =
      cartItems && cartItems.length > 0
        ? cartItems.map((item: any) => ({
            title: item.name,
            unit_price: item.price,
            quantity: item.quantity,
          }))
        : [
            {
              title,
              unit_price: price,
              quantity,
            },
          ]

    const result = await preference.create({
      body: {
        items,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?order=${orderNumber}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure?order=${orderNumber}`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/pending?order=${orderNumber}`,
        },
        auto_return: "approved",
        external_reference: orderNumber,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`,
      },
    })

    return NextResponse.json({ id: result.id, orderNumber })
  } catch (error) {
    console.error("Error creating preference:", error)
    return NextResponse.json({ error: "Error creating preference" }, { status: 500 })
  }
}

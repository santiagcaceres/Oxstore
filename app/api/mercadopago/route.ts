import { type NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting MercadoPago preference creation")
    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body, null, 2))

    const { items, customerInfo, shippingCost = 0, shippingMethod = "pickup" } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("[v0] Invalid items:", items)
      return NextResponse.json({ error: "Items are required" }, { status: 400 })
    }

    if (!customerInfo || !customerInfo.email || !customerInfo.firstName) {
      console.error("[v0] Invalid customer info:", customerInfo)
      return NextResponse.json({ error: "Customer information is required" }, { status: 400 })
    }

    const orderNumber = `ORD-${Date.now()}`
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0)
    const totalAmount = subtotal + shippingCost

    console.log("[v0] Order details:", { orderNumber, subtotal, totalAmount, shippingCost })

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_email: customerInfo.email,
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName || ""}`.trim(),
        customer_phone: customerInfo.phone || "",
        customer_dni: customerInfo.dni || "",
        shipping_address:
          shippingMethod === "delivery"
            ? `${customerInfo.address || ""}, ${customerInfo.city || ""}, ${customerInfo.postalCode || ""}`.trim()
            : "Retiro en sucursal",
        billing_address: customerInfo.address || "No especificada",
        total_amount: totalAmount,
        shipping_cost: shippingCost,
        shipping_method: shippingMethod,
        payment_method: "mercadopago",
        payment_status: "pending",
        order_status: "pending",
        status: "pending",
        notes: `Método de entrega: ${shippingMethod === "pickup" ? "Retiro en sucursal" : "Envío a domicilio"}`,
      })
      .select()
      .single()

    if (orderError) {
      console.error("[v0] Error creating order:", orderError)
      return NextResponse.json({ error: "Error creating order: " + orderError.message }, { status: 500 })
    }

    console.log("[v0] Order created successfully:", order.id)

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name || "Producto sin nombre",
      product_image: item.image || "",
      quantity: item.quantity || 1,
      price: item.price || 0, // Usar 'price' en lugar de 'unit_price'
      total: (item.price || 0) * (item.quantity || 1), // Usar 'total' en lugar de 'total_price'
    }))

    console.log("[v0] Inserting order items:", orderItems)

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[v0] Error creating order items:", itemsError)
      return NextResponse.json({ error: "Error creating order items: " + itemsError.message }, { status: 500 })
    }

    console.log("[v0] Order items created successfully")

    const preference = new Preference(client)

    const mercadoPagoItems = items.map((item: any) => {
      const price = Number.parseFloat(item.price) || 0
      if (price <= 0) {
        throw new Error(`Invalid price for item ${item.name}: ${price}`)
      }
      return {
        title: item.name || "Producto",
        unit_price: price,
        quantity: Number.parseInt(item.quantity) || 1,
      }
    })

    // Agregar costo de envío como item separado si aplica
    if (shippingCost > 0) {
      mercadoPagoItems.push({
        title: "Envío a domicilio",
        unit_price: Number.parseFloat(shippingCost.toString()),
        quantity: 1,
      })
    }

    console.log("[v0] MercadoPago items:", mercadoPagoItems)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
      console.error("[v0] NEXT_PUBLIC_SITE_URL not configured")
      return NextResponse.json({ error: "Site URL not configured" }, { status: 500 })
    }

    const preferenceData = {
      items: mercadoPagoItems,
      back_urls: {
        success: `${siteUrl}/checkout/exito?order_id=${order.id}`,
        failure: `${siteUrl}/checkout?error=payment_failed`,
        pending: `${siteUrl}/checkout?status=pending&order_id=${order.id}`,
      },
      auto_return: "approved",
      external_reference: orderNumber,
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
      payer: {
        name: customerInfo.firstName,
        surname: customerInfo.lastName || "",
        email: customerInfo.email,
        phone: {
          number: customerInfo.phone || "",
        },
      },
    }

    console.log("[v0] Creating MercadoPago preference with data:", JSON.stringify(preferenceData, null, 2))

    const result = await preference.create({
      body: preferenceData,
    })

    console.log("[v0] MercadoPago preference created successfully:", result.id)

    return NextResponse.json({
      id: result.id,
      orderNumber,
      orderId: order.id,
      init_point: result.init_point,
    })
  } catch (error: any) {
    console.error("[v0] MercadoPago API error:", error.status || 500, error.message || error)
    console.error("[v0] Error creating preference:", error)
    return NextResponse.json(
      {
        error: "Error creating preference",
        details: error.message || error.toString(),
      },
      { status: 500 },
    )
  }
}

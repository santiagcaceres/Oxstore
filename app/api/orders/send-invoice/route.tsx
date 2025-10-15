import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { generateInvoiceHTML } from "@/lib/invoice-generator"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    console.log("[v0] Sending invoice for order ID:", orderId)

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          unit_price,
          price,
          total_price,
          total,
          size,
          color
        )
      `)
      .eq("id", orderId)
      .single()

    if (error || !order) {
      console.error("[v0] Error fetching order:", error)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!order.customer_email) {
      console.error("[v0] No customer email found")
      return NextResponse.json({ error: "No customer email" }, { status: 400 })
    }

    const invoiceHTML = generateInvoiceHTML(order)

    await resend.emails.send({
      from: "Oxstore <info@oxstoreuy.com>",
      to: order.customer_email,
      subject: `Confirmación de Pedido #${order.order_number} - Oxstore`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000; margin-bottom: 20px;">¡Gracias por tu compra en Oxstore!</h2>
          <p style="color: #333; margin-bottom: 20px;">Tu pedido #${order.order_number} ha sido recibido y está siendo procesado.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Número de Pedido:</strong> ${order.order_number}</p>
            <p style="margin: 10px 0 0 0;"><strong>Total:</strong> $${order.total_amount}</p>
            <p style="margin: 10px 0 0 0;"><strong>Método de Pago:</strong> ${order.payment_method === "cash" ? "Efectivo" : "Transferencia"}</p>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">Adjuntamos tu factura en este email.</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Factura-${order.order_number}.html`,
          content: Buffer.from(invoiceHTML).toString("base64"),
        },
      ],
    })

    console.log(`[v0] Invoice email sent to ${order.customer_email}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error sending invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

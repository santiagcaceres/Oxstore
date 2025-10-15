import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    console.log("[v0] Sending admin notification for order ID:", orderId)

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          product_name,
          product_image,
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

    const orderItems = order.order_items || []
    const productsHTML = orderItems
      .map(
        (item: any) => `
        <div style="display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <img 
            src="${item.product_image || "/placeholder.svg?height=80&width=80"}" 
            alt="${item.product_name}"
            style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 16px;"
          />
          <div style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${item.product_name}</h4>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              Cantidad: ${item.quantity} × $${(Number.parseFloat(item.unit_price || item.price) || 0).toFixed(2)}
            </p>
            ${
              item.size || item.color
                ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">
              ${item.size ? `Talla: ${item.size}` : ""}
              ${item.size && item.color ? " • " : ""}
              ${item.color ? `Color: ${item.color}` : ""}
            </p>`
                : ""
            }
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">
              $${(Number.parseFloat(item.total_price || item.total) || 0).toFixed(2)}
            </p>
          </div>
        </div>
      `,
      )
      .join("")

    await resend.emails.send({
      from: "Oxstore <info@oxstoreuy.com>",
      to: "info@oxstoreuy.com",
      subject: `🔔 Nuevo Pedido #${order.order_number} - ${order.customer_name}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #1f2937; color: white; padding: 24px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Nuevo Pedido Recibido</h1>
          </div>
          
          <div style="padding: 32px;">
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #92400e; font-weight: 600;">
                ⚠️ Acción requerida: Nuevo pedido pendiente de procesamiento
              </p>
            </div>
            
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">Detalles del Pedido</h2>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-weight: 500;">Número de Pedido:</span>
                <span style="color: #1f2937; font-weight: 700; margin-left: 8px;">${order.order_number}</span>
              </div>
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-weight: 500;">Cliente:</span>
                <span style="color: #1f2937; font-weight: 600; margin-left: 8px;">${order.customer_name}</span>
              </div>
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-weight: 500;">Email:</span>
                <span style="color: #1f2937; font-weight: 600; margin-left: 8px;">${order.customer_email}</span>
              </div>
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-weight: 500;">Teléfono:</span>
                <span style="color: #1f2937; font-weight: 600; margin-left: 8px;">${order.customer_phone || "N/A"}</span>
              </div>
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-weight: 500;">Método de Pago:</span>
                <span style="color: #1f2937; font-weight: 600; margin-left: 8px;">
                  ${order.payment_method === "cash" ? "Efectivo" : order.payment_method === "transfer" ? "Transferencia" : "MercadoPago"}
                </span>
              </div>
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-weight: 500;">Método de Envío:</span>
                <span style="color: #1f2937; font-weight: 600; margin-left: 8px;">
                  ${order.shipping_method === "pickup" ? "Retiro en Sucursal" : "Envío a Domicilio"}
                </span>
              </div>
              <div>
                <span style="color: #6b7280; font-weight: 500;">Total:</span>
                <span style="color: #3b82f6; font-weight: 700; font-size: 20px; margin-left: 8px;">$${order.total_amount}</span>
              </div>
            </div>
            
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Productos</h3>
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
              ${productsHTML}
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/pedidos/${order.id}" 
               style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              Ver Pedido en el Admin
            </a>
          </div>
        </div>
      `,
    })

    console.log(`[v0] Admin notification email sent to info@oxstoreuy.com`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error sending admin notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

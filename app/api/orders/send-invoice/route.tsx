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
          product_image,
          quantity,
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

    const orderItems = order.order_items || []
    const productsHTML = orderItems
      .map(
        (item: any) => `
        <div style="display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #e5e7eb; background: white;">
          <img 
            src="${item.product_image || "/placeholder.svg?height=80&width=80"}" 
            alt="${item.product_name}"
            style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 16px; border: 1px solid #e5e7eb;"
          />
          <div style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${item.product_name}</h4>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              Cantidad: ${item.quantity} × $${(Number.parseFloat(item.price) || 0).toFixed(2)}
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

    const paymentMethodText =
      order.payment_method === "cash"
        ? "Efectivo (pago al recibir)"
        : order.payment_method === "transfer"
          ? "Transferencia Bancaria"
          : "MercadoPago"

    const shippingMethodText = order.shipping_method === "pickup" ? "Retiro en Sucursal" : "Envío a Domicilio"

    await resend.emails.send({
      from: "Oxstore <info@oxstoreuy.com>",
      to: order.customer_email,
      subject: `✅ Confirmación de Pedido #${order.order_number} - Oxstore`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 40px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 2px;">OXSTORE</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">¡Gracias por confiar en nosotros!</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">¡Tu pedido ha sido recibido! 🎉</h2>
            <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
              Hola <strong>${order.customer_name}</strong>, hemos recibido tu pedido y estamos preparándolo con mucho cuidado. 
              Te mantendremos informado sobre cada paso del proceso.
            </p>
            
            <!-- Order Summary -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280; font-weight: 500;">Número de Pedido:</span>
                <span style="color: #1f2937; font-weight: 700;">${order.order_number}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280; font-weight: 500;">Fecha:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date(order.created_at).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280; font-weight: 500;">Método de Pago:</span>
                <span style="color: #1f2937; font-weight: 600;">${paymentMethodText}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280; font-weight: 500;">Método de Entrega:</span>
                <span style="color: #1f2937; font-weight: 600;">${shippingMethodText}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #e5e7eb; margin-top: 12px;">
                <span style="color: #6b7280; font-weight: 500;">Total:</span>
                <span style="color: #3b82f6; font-weight: 700; font-size: 20px;">$${order.total_amount}</span>
              </div>
            </div>
            
            <!-- Products -->
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Productos de tu pedido</h3>
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
              ${productsHTML}
            </div>
            
            <!-- Next Steps -->
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
              <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">📋 Próximos pasos</h4>
              <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                ${
                  order.payment_method === "cash"
                    ? order.shipping_method === "pickup"
                      ? "• Te contactaremos cuando tu pedido esté listo para retirar en nuestra sucursal<br>• El pago se realizará en efectivo al momento del retiro<br>• No olvides traer este comprobante y tu documento de identidad"
                      : "• Nuestro repartidor te contactará para coordinar la entrega<br>• El pago se realizará en efectivo al momento de recibir tu pedido<br>• Asegúrate de tener el monto exacto para facilitar la transacción"
                    : order.payment_method === "transfer"
                      ? "• Revisa los datos bancarios adjuntos en este email<br>• Realiza la transferencia por el monto exacto<br>• Envía el comprobante a pagos@oxstoreuy.com<br>• Una vez confirmado el pago, procesaremos tu pedido"
                      : "• Tu pago ha sido confirmado exitosamente<br>• Estamos preparando tu pedido para el envío<br>• Te notificaremos cuando esté en camino"
                }
              </p>
            </div>
            
            <!-- Contact Info -->
            <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">¿Tienes alguna pregunta sobre tu pedido?</p>
              <p style="margin: 0 0 16px 0; color: #3b82f6; font-weight: 600; font-size: 16px;">
                📧 info@oxstoreuy.com | 📞 (598) 1234-5678
              </p>
              <div style="background: white; padding: 16px; border-radius: 6px; margin-top: 16px;">
                <p style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600; font-size: 14px;">Horarios de Atención</p>
                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                  Lunes a Viernes: 09:00 - 12:00 y 14:00 - 19:00<br>
                  Sábados: 09:00 - 13:00
                </p>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600; font-size: 14px;">
              Adjuntamos tu factura detallada en este email
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} Oxstore. Todos los derechos reservados.
            </p>
          </div>
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

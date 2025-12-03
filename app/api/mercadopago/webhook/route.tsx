import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { generateInvoiceHTML } from "@/lib/invoice-generator"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.type === "payment") {
      const paymentId = body.data.id
      const externalReference = body.external_reference

      let paymentStatus = "pending"
      let orderStatus = "pending"

      if (body.action === "payment.created" || body.action === "payment.updated") {
        paymentStatus = "approved"
        orderStatus = "confirmed"
      }

      if (externalReference) {
        await supabase
          .from("orders")
          .update({
            payment_status: paymentStatus,
            status: orderStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("order_number", externalReference)

        if (paymentStatus === "approved") {
          const { data: order } = await supabase
            .from("orders")
            .select(`
              *,
              order_items (
                product_name,
                product_image,
                quantity,
                price,
                total_price,
                total
              )
            `)
            .eq("order_number", externalReference)
            .single()

          if (order) {
            try {
              const invoiceHTML = generateInvoiceHTML(order)

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
                      Cantidad: ${item.quantity} × $${(Number.parseFloat(item.price) || 0).toFixed(2)}
                    </p>
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

              if (order.customer_email) {
                await resend.emails.send({
                  from: "Oxstore <info@oxstoreuy.com>",
                  to: order.customer_email,
                  subject: `✅ Confirmación de Pedido #${order.order_number} - Oxstore`,
                  html: `
                    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                      <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 40px; text-align: center;">
                        <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 2px;">OXSTORE</h1>
                        <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">¡Gracias por tu compra!</p>
                      </div>
                      
                      <div style="padding: 40px;">
                        <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Tu pedido ha sido confirmado</h2>
                        <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 16px;">
                          Hemos recibido tu pago y tu pedido #${order.order_number} está siendo procesado.
                        </p>
                        
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
                          <div style="display: flex; justify-between; margin-bottom: 8px;">
                            <span style="color: #6b7280; font-weight: 500;">Número de Pedido:</span>
                            <span style="color: #1f2937; font-weight: 700;">${order.order_number}</span>
                          </div>
                          <div style="display: flex; justify-between; margin-bottom: 8px;">
                            <span style="color: #6b7280; font-weight: 500;">Fecha:</span>
                            <span style="color: #1f2937; font-weight: 600;">${new Date(order.created_at).toLocaleDateString("es-ES")}</span>
                          </div>
                          <div style="display: flex; justify-between;">
                            <span style="color: #6b7280; font-weight: 500;">Total:</span>
                            <span style="color: #3b82f6; font-weight: 700; font-size: 20px;">$${order.total_amount}</span>
                          </div>
                        </div>
                        
                        <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Productos de tu pedido</h3>
                        <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
                          ${productsHTML}
                        </div>
                        
                        <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center;">
                          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">¿Tienes alguna pregunta?</p>
                          <p style="margin: 0; color: #3b82f6; font-weight: 600; font-size: 16px;">
                            📧 info@oxstoreuy.com | 📞 (598) 1234-5678
                          </p>
                        </div>
                      </div>
                      
                      <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
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
              }

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
                          <span style="color: #1f2937; font-weight: 600; margin-left: 8px;">MercadoPago</span>
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
            } catch (emailError) {
              console.error("[v0] Error sending invoice email:", emailError)
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}

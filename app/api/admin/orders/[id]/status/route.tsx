import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()

    console.log(`[v0] PATCH /api/admin/orders/${params.id}/status - New status: ${status}`)
    const supabase = createClient()

    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        order_status: status,
        status: status,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (updateError || !order) {
      console.error("[v0] Error updating order status:", updateError)
      return NextResponse.json({ error: "Error al actualizar el estado del pedido" }, { status: 500 })
    }

    const statusMessages = {
      pending: {
        subject: "📦 Pedido Recibido - Oxstore",
        title: "¡Hemos recibido tu pedido!",
        message:
          "Tu pedido ha sido recibido exitosamente y está siendo revisado por nuestro equipo. Te notificaremos cuando comencemos a prepararlo.",
        icon: "📦",
        color: "#f59e0b",
      },
      processing: {
        subject: "⚙️ Pedido en Preparación - Oxstore",
        title: "¡Estamos preparando tu pedido!",
        message:
          "Nuestro equipo está empaquetando cuidadosamente tus productos. Pronto estará listo para el envío o retiro.",
        icon: "⚙️",
        color: "#3b82f6",
      },
      shipped: {
        subject: "🚚 Pedido Enviado - Oxstore",
        title: "¡Tu pedido está en camino!",
        message:
          "Tu pedido ha sido despachado y está en camino hacia ti. Recibirás una notificación cuando esté cerca de ser entregado.",
        icon: "🚚",
        color: "#8b5cf6",
      },
      delivered: {
        subject: "✅ Pedido Entregado - Oxstore",
        title: "¡Tu pedido ha sido entregado!",
        message:
          "Tu pedido ha sido entregado exitosamente. ¡Esperamos que disfrutes tus productos! Si tienes alguna consulta, no dudes en contactarnos.",
        icon: "✅",
        color: "#10b981",
      },
    }

    const statusInfo = statusMessages[status as keyof typeof statusMessages]

    if (statusInfo && order.customer_email) {
      try {
        await resend.emails.send({
          from: "Oxstore <info@oxstoreuy.com>",
          to: order.customer_email,
          subject: statusInfo.subject,
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); color: white; padding: 40px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">${statusInfo.icon}</div>
                <h1 style="margin: 0; font-size: 28px; font-weight: 700;">OXSTORE</h1>
                <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Actualización de tu pedido</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px;">
                <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">${statusInfo.title}</h2>
                <p style="color: #6b7280; margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">
                  ${statusInfo.message}
                </p>
                
                <!-- Order Info -->
                <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid ${statusInfo.color};">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span style="color: #6b7280; font-weight: 500;">Número de Pedido:</span>
                    <span style="color: #1f2937; font-weight: 700;">${order.order_number}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span style="color: #6b7280; font-weight: 500;">Estado Actual:</span>
                    <span style="color: ${statusInfo.color}; font-weight: 700; text-transform: capitalize;">${status === "pending" ? "Pendiente" : status === "processing" ? "En Preparación" : status === "shipped" ? "Enviado" : "Entregado"}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280; font-weight: 500;">Total:</span>
                    <span style="color: #1f2937; font-weight: 700; font-size: 18px;">$${order.total_amount}</span>
                  </div>
                </div>
                
                <!-- Contact Info -->
                <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">¿Tienes alguna pregunta?</p>
                  <p style="margin: 0; color: #3b82f6; font-weight: 600; font-size: 16px;">
                    📧 info@oxstoreuy.com | 📞 (598) 1234-5678
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  © ${new Date().getFullYear()} Oxstore. Todos los derechos reservados.
                </p>
              </div>
            </div>
          `,
        })
        console.log(`[v0] Email sent to ${order.customer_email}`)
      } catch (emailError) {
        console.error("[v0] Error sending email:", emailError)
      }
    }

    console.log(`[v0] Order ${params.id} status updated to ${status}`)
    return NextResponse.json({ order })
  } catch (error) {
    console.error("[v0] Error in PATCH /api/admin/orders/[id]/status:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

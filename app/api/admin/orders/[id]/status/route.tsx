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
        subject: "Pedido Recibido - Oxstore",
        message: "Tu pedido ha sido recibido y está siendo procesado.",
      },
      processing: {
        subject: "Pedido en Proceso - Oxstore",
        message: "Tu pedido está siendo empaquetado y preparado para el envío.",
      },
      shipped: {
        subject: "Pedido Enviado - Oxstore",
        message: "Tu pedido ha sido enviado y está en camino.",
      },
      delivered: {
        subject: "Pedido Entregado - Oxstore",
        message: "Tu pedido ha sido entregado. ¡Esperamos que lo disfrutes!",
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
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Actualización de tu Pedido #${order.order_number}</h2>
              <p style="font-size: 16px; color: #666;">${statusInfo.message}</p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Número de Pedido:</strong> ${order.order_number}</p>
                <p style="margin: 10px 0 0 0;"><strong>Estado:</strong> ${status}</p>
              </div>
              <p style="font-size: 14px; color: #999;">Gracias por tu compra en Oxstore.</p>
            </div>
          `,
        })
        console.log(`[v0] Email sent to ${order.customer_email}`)
      } catch (emailError) {
        console.error("[v0] Error sending email:", emailError)
        // No fallar la actualización si el email falla
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

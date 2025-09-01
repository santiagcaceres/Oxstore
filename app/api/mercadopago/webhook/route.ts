import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.type === "payment") {
      const paymentId = body.data.id
      const externalReference = body.external_reference

      // Actualizar estado del pedido según el pago
      let paymentStatus = "pending"
      let orderStatus = "pending"

      if (body.action === "payment.created" || body.action === "payment.updated") {
        // Aquí podrías hacer una llamada a la API de MercadoPago para obtener el estado exacto del pago
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
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}

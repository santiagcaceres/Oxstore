import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createOrderInZureo } from "@/lib/zureo-api"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verificar que es una notificación de pago
    if (body.type === "payment") {
      const paymentId = body.data.id
      
      // Obtener los detalles del pago desde MercadoPago
      const payment = new Payment(client)
      const paymentData = await payment.get({ id: paymentId })
      
      // Si el pago fue aprobado, crear la orden en Zureo
      if (paymentData.status === "approved") {
        try {
          // Aquí deberías extraer los datos del pago para crear la orden
          // Por ahora, creamos una orden básica
          const orderData = {
            cliente: {
              nombre: paymentData.payer?.first_name || "",
              apellido: paymentData.payer?.last_name || "",
              email: paymentData.payer?.email || "",
              telefono: paymentData.payer?.phone?.number || "",
            },
            productos: [], // Aquí deberías mapear los productos del pago
            total: paymentData.transaction_amount || 0,
            estado: "pagado",
            referencia_externa: paymentData.external_reference || "",
            metodo_pago: "mercadopago",
            id_pago_mp: paymentId,
          }
          
          await createOrderInZureo(orderData)
          console.log(`Orden creada en Zureo para el pago ${paymentId}`)
        } catch (error) {
          console.error("Error creando orden en Zureo:", error)
        }
      }
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing MercadoPago webhook:", error)
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    )
  }
}

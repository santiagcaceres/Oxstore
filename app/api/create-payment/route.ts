import { NextResponse } from "next/server"
import mercadopago from "mercadopago"
import type { MercadoPagoPreference } from "@/types/mercadopago"

// Configurar Mercado Pago con el Access Token
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const { items, payer, external_reference } = await request.json()

    if (!items || !payer || !external_reference) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    const preference: MercadoPagoPreference = {
      items: items,
      payer: payer,
      external_reference: external_reference,
      back_urls: {
        success: `${baseUrl}/confirmacion`,
        failure: `${baseUrl}/checkout?status=failure`,
        pending: `${baseUrl}/checkout?status=pending`,
      },
      auto_return: "approved",
      // notification_url: `${baseUrl}/api/webhooks/mercadopago`, // Futuro: para confirmación automática
    }

    const response = await mercadopago.preferences.create(preference)

    return NextResponse.json({ id: response.body.id, init_point: response.body.init_point })
  } catch (error) {
    console.error("Error al crear preferencia de Mercado Pago:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

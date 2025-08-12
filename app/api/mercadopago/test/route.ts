import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: "MERCADOPAGO_ACCESS_TOKEN no está configurado",
      })
    }

    // Probar conexión básica con MercadoPago
    const response = await fetch("https://api.mercadopago.com/v1/payment_methods", {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Error HTTP ${response.status}: Token inválido o expirado`,
      })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "MercadoPago configurado correctamente",
      paymentMethods: data.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

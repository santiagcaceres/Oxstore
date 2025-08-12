import { NextResponse } from "next/server"
import { getPaymentMethodsFromZureo } from "@/lib/zureo-api"

export async function GET() {
  try {
    const paymentMethods = await getPaymentMethodsFromZureo()
    return NextResponse.json({ success: true, data: paymentMethods })
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}

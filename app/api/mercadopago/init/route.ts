import { NextResponse } from "next/server"

export async function GET() {
  try {
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY

    if (!publicKey) {
      return NextResponse.json({ error: "MercadoPago public key not configured" }, { status: 500 })
    }

    return NextResponse.json({ publicKey })
  } catch (error) {
    console.error("Error getting MercadoPago public key:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

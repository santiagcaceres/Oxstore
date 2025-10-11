import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY || "APP_USR-df3310aa-288a-42e0-8ed7-18ff83fdeabd"

    console.log("[v0] MercadoPago init - Public key exists:", !!publicKey)
    console.log("[v0] MercadoPago init - Public key prefix:", publicKey?.substring(0, 10))

    if (!publicKey) {
      console.error("[v0] MercadoPago public key not configured")
      return NextResponse.json({ error: "MercadoPago public key not configured" }, { status: 500 })
    }

    console.log("[v0] MercadoPago init - Returning public key successfully")
    return NextResponse.json({ publicKey })
  } catch (error) {
    console.error("[v0] Error getting MercadoPago public key:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

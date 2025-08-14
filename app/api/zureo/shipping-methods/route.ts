import { NextResponse } from "next/server"
import { getShippingMethodsFromZureo } from "@/lib/zureo-api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const emp = Number.parseInt(searchParams.get("emp") || "1")

    const shippingMethods = await getShippingMethodsFromZureo(emp)
    return NextResponse.json({ success: true, data: shippingMethods })
  } catch (error) {
    console.error("Error fetching shipping methods:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}

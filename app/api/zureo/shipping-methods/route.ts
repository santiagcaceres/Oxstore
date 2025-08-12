import { NextResponse } from "next/server"
import { getShippingMethodsFromZureo } from "@/lib/zureo-api"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const emp = Number.parseInt(url.searchParams.get("emp") || "1")

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

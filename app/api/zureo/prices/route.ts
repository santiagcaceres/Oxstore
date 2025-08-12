import { NextResponse } from "next/server"
import { getPricesFromZureo } from "@/lib/zureo-api"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const emp = Number.parseInt(url.searchParams.get("emp") || "1")

    const prices = await getPricesFromZureo(emp)
    return NextResponse.json({ success: true, data: prices })
  } catch (error) {
    console.error("Error fetching prices:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}

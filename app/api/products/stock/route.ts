import { NextResponse } from "next/server"
import { getStockBySucursal } from "@/lib/zureo-api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const stock = await getStockBySucursal()
    return NextResponse.json({ success: true, data: stock })
  } catch (error) {
    console.error("Error fetching stock from Zureo:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stock" }, { status: 500 })
  }
}

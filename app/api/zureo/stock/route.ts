import { NextResponse } from "next/server"
import { getStockBySucursal } from "@/lib/zureo-api"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const emp = Number.parseInt(url.searchParams.get("emp") || "1")
    const suc = Number.parseInt(url.searchParams.get("suc") || "1")
    const date = url.searchParams.get("date") || undefined

    const stock = await getStockBySucursal(emp, suc, date)
    return NextResponse.json({ success: true, data: stock })
  } catch (error) {
    console.error("Error fetching stock:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}

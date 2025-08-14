import { NextResponse } from "next/server"
import { getStockBySucursal } from "@/lib/zureo-api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const emp = Number.parseInt(searchParams.get("emp") || "1")
    const suc = Number.parseInt(searchParams.get("suc") || "1")
    const date = searchParams.get("date") || undefined

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

import { NextResponse } from "next/server"
import { getCompaniesFromZureo } from "@/lib/zureo-api"

export async function GET() {
  try {
    const companies = await getCompaniesFromZureo()
    return NextResponse.json({ success: true, data: companies })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}

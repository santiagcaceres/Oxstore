import { NextResponse } from "next/server"
import { getCompanyById } from "@/lib/zureo-api"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const company = await getCompanyById(Number.parseInt(params.id))
    return NextResponse.json({ success: true, data: company })
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}

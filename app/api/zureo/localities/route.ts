import { NextResponse } from "next/server"
import { getLocalitiesFromZureo } from "@/lib/zureo-api"

export async function GET() {
  try {
    const localities = await getLocalitiesFromZureo()
    return NextResponse.json({ success: true, data: localities })
  } catch (error) {
    console.error("Error fetching localities:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}

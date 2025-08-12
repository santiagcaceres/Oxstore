import { NextResponse } from "next/server"
import { getProductTypesFromZureo } from "@/lib/zureo-api"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const emp = Number.parseInt(url.searchParams.get("emp") || "1")

    const productTypes = await getProductTypesFromZureo(emp)
    return NextResponse.json({ success: true, data: productTypes })
  } catch (error) {
    console.error("Error fetching product types:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}

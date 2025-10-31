import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { brand: string } }) {
  try {
    const supabase = await createClient()
    const brand = decodeURIComponent(params.brand)

    console.log(`[v0] Fetching size guide for brand: ${brand}`)

    const { data, error } = await supabase
      .from("size_guides")
      .select("*")
      .eq("brand", brand)
      .is("subcategory", null)
      .single()

    if (error) {
      console.log(`[v0] No size guide found for brand: ${brand}`)
      return NextResponse.json({ error: "Size guide not found" }, { status: 404 })
    }

    console.log(`[v0] Size guide found for brand: ${brand}`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching brand size guide:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

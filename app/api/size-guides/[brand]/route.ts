import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { brand: string } }) {
  try {
    const supabase = await createClient()
    const brand = decodeURIComponent(params.brand)

    const { data, error } = await supabase.from("size_guides").select("*").eq("brand", brand).single()

    if (error) {
      return NextResponse.json({ error: "Size guide not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching size guide:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

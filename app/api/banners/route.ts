import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get("position")

    let query = supabase.from("banners").select("*").eq("is_active", true).order("position", { ascending: true })

    if (position) {
      query = query.eq("position", position) // Fixed position filtering to use string instead of parseInt
    }

    const { data: banners, error } = await query

    if (error) {
      if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) {
        console.log("Banners table structure outdated - please run SQL scripts 5, 6, and 7")
        return NextResponse.json([]) // Return array directly for admin compatibility
      }
      console.error("Error fetching banners:", error)
      return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
    }

    return NextResponse.json(banners || []) // Return array directly instead of wrapped object
  } catch (error) {
    console.error("Error in banners API:", error)
    return NextResponse.json([]) // Return empty array directly
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: banner, error } = await supabase.from("banners").insert([body]).select().single()

    if (error) {
      console.error("Error creating banner:", error)
      return NextResponse.json({ error: "Failed to create banner" }, { status: 500 })
    }

    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 })
  }
}

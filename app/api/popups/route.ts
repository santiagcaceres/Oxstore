import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data: popup, error } = await supabase
      .from("popups")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json({ popup: null })
      }
      if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) {
        // Table doesn't exist yet - user needs to run SQL scripts
        console.log("Popups table not found - please run SQL scripts 5, 6, and 7")
        return NextResponse.json({ popup: null })
      }
      console.error("Error fetching popup:", error)
      return NextResponse.json({ error: "Failed to fetch popup" }, { status: 500 })
    }

    return NextResponse.json({ popup: popup || null })
  } catch (error) {
    console.error("Error in popups API:", error)
    return NextResponse.json({ popup: null }) // Return null instead of error to prevent homepage crash
  }
}

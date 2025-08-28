import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured_only = searchParams.get("featured_only") === "true"

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("updated_at", { ascending: false })

    if (featured_only) {
      query = query.eq("is_featured", true)
    }

    const { data: products, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { product_ids, is_featured } = await request.json()

    const { data, error } = await supabase.from("products").update({ is_featured }).in("id", product_ids).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      updated_products: data?.length || 0,
    })
  } catch (error) {
    console.error("Error updating featured products:", error)
    return NextResponse.json({ error: "Failed to update products" }, { status: 500 })
  }
}

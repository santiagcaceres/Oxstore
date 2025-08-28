import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .gt("discount_percentage", 0)
      .eq("is_active", true)
      .order("discount_percentage", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching discounted products:", error)
    return NextResponse.json({ error: "Failed to fetch discounted products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { product_id, discount_percentage } = await request.json()

    // Get current product to calculate sale price
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("price")
      .eq("id", product_id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const sale_price = discount_percentage > 0 ? product.price * (1 - discount_percentage / 100) : null

    const { data, error } = await supabase
      .from("products")
      .update({
        discount_percentage,
        sale_price,
      })
      .eq("id", product_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error("Error applying discount:", error)
    return NextResponse.json({ error: "Failed to apply discount" }, { status: 500 })
  }
}

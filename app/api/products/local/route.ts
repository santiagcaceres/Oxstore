import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return Response.json({
      success: true,
      products: products || [],
    })
  } catch (error) {
    console.error("Error loading local products:", error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      products: [],
    })
  }
}

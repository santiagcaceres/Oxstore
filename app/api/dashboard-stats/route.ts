export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: products } = await supabase
      .from("products_in_stock")
      .select("price, stock_quantity")
      .gt("stock_quantity", 0)

    const { data: categories } = await supabase.from("categories").select("id")

    const lowStockProducts = products?.filter((p) => p.stock_quantity <= 5).length || 0
    const totalValue = products?.reduce((sum, p) => sum + p.price * p.stock_quantity, 0) || 0

    return NextResponse.json({
      totalProducts: products?.length || 0,
      totalCategories: categories?.length || 0,
      lowStockProducts,
      totalValue,
      lastSync: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({
      totalProducts: 0,
      totalCategories: 0,
      lowStockProducts: 0,
      totalValue: 0,
      lastSync: null,
    })
  }
}

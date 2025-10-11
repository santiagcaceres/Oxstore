import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verificar productos totales
    const { count: totalProducts } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })

    // Productos activos con stock
    const { count: activeProducts } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gt("stock_quantity", 0)

    // Productos por categoría
    const { data: byCategory } = await supabase
      .from("products_in_stock")
      .select("category")
      .eq("is_active", true)
      .gt("stock_quantity", 0)

    const categoryCounts = byCategory?.reduce(
      (acc, item) => {
        const cat = item.category || "Sin categoría"
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Productos por marca
    const { data: byBrand } = await supabase
      .from("products_in_stock")
      .select("brand")
      .eq("is_active", true)
      .gt("stock_quantity", 0)

    const brandCounts = byBrand?.reduce(
      (acc, item) => {
        const brand = item.brand || "Sin marca"
        acc[brand] = (acc[brand] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Muestra de productos
    const { data: sampleProducts } = await supabase
      .from("products_in_stock")
      .select("id, name, category, brand, price, stock_quantity, color, size, is_active")
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .order("created_at", { ascending: false })
      .limit(10)

    // Productos con precios
    const { count: withPrice } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .not("price", "is", null)
      .gt("price", 0)

    // Productos sin categoría o marca
    const { count: noCategory } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .or("category.is.null,category.eq.")

    const { count: noBrand } = await supabase
      .from("products_in_stock")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .or("brand.is.null,brand.eq.")

    return NextResponse.json({
      success: true,
      summary: {
        totalProducts,
        activeProducts,
        withPrice,
        noCategory,
        noBrand,
      },
      byCategory: categoryCounts,
      byBrand: brandCounts,
      sampleProducts,
    })
  } catch (error) {
    console.error("[v0] Error checking products:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

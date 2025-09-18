import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const zureoCode = searchParams.get("zureo_code")

    if (!zureoCode) {
      return NextResponse.json({ error: "zureo_code es requerido" }, { status: 400 })
    }

    console.log(`[v0] Loading variants for zureo_code: ${zureoCode}`)

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: product, error: productError } = await supabase
      .from("products_in_stock")
      .select("id")
      .eq("zureo_code", zureoCode)
      .single()

    if (productError || !product) {
      console.error("Product not found:", productError)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("id, color, size, stock_quantity, price, variety_name, zureo_variety_id")
      .eq("product_id", product.id)
      .gt("stock_quantity", 0) // Solo variantes con stock
      .order("id", { ascending: true })

    if (error) {
      console.error("Error loading variants:", error)
      return NextResponse.json({ error: "Error al cargar variantes" }, { status: 500 })
    }

    console.log(`[v0] Found ${variants?.length || 0} variants for product ${product.id}`)

    return NextResponse.json(variants || [])
  } catch (error) {
    console.error("Error in variants API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

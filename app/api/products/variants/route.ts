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

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Buscar todas las variantes del mismo producto base
    const { data: variants, error } = await supabase
      .from("products_in_stock")
      .select("id, color, size, stock_quantity, price")
      .eq("zureo_code", zureoCode)
      .gt("stock_quantity", 0) // Solo variantes con stock

    if (error) {
      console.error("Error loading variants:", error)
      return NextResponse.json({ error: "Error al cargar variantes" }, { status: 500 })
    }

    return NextResponse.json(variants || [])
  } catch (error) {
    console.error("Error in variants API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

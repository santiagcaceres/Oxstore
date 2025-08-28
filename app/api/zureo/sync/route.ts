import { type NextRequest, NextResponse } from "next/server"
import { zureoAPI } from "@/lib/zureo-api"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting product synchronization from Zureo...")

    // Get all products from Zureo
    const zureoProducts = await zureoAPI.getAllProducts()
    console.log(`[v0] Fetched ${zureoProducts.length} products from Zureo`)

    // Transform and insert products
    const transformedProducts = zureoProducts.map((product) => ({
      zureo_id: product.id,
      code: product.codigo,
      name: product.nombre,
      short_description: product.descripcion_corta || "",
      long_description: product.descripcion_larga || "",
      price: product.precio,
      stock: product.stock,
      brand: product.marca?.nombre || "",
      category: product.tipo?.nombre || "",
      created_at: new Date(product.fecha_alta),
      updated_at: new Date(product.fecha_modificado),
      is_active: true,
      images: [],
      slug: product.nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      // Custom fields for local management
      custom_name: null,
      custom_description: null,
      custom_images: [],
      is_featured: false,
      discount_percentage: 0,
      sale_price: null,
    }))

    // Upsert products (insert or update if exists)
    const { data, error } = await supabase
      .from("products")
      .upsert(transformedProducts, {
        onConflict: "zureo_id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[v0] Successfully synchronized ${data?.length || 0} products`)

    // Sync brands
    const zureoBrands = await zureoAPI.getBrands()
    const transformedBrands = zureoBrands.map((brand) => ({
      zureo_id: brand.id,
      name: brand.nombre,
      slug: brand.nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      updated_at: new Date(brand.fecha_modificado),
    }))

    await supabase.from("brands").upsert(transformedBrands, { onConflict: "zureo_id" })

    console.log(`[v0] Synchronized ${zureoBrands.length} brands`)

    return NextResponse.json({
      success: true,
      products_synced: data?.length || 0,
      brands_synced: zureoBrands.length,
      message: "Synchronization completed successfully",
    })
  } catch (error) {
    console.error("[v0] Sync error:", error)
    return NextResponse.json({ error: "Failed to synchronize products" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get sync status
    const { data: products, error } = await supabase
      .from("products")
      .select("id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const lastSync = products?.[0]?.updated_at || null

    const { count } = await supabase.from("products").select("*", { count: "exact", head: true })

    return NextResponse.json({
      last_sync: lastSync,
      total_products: count || 0,
    })
  } catch (error) {
    console.error("[v0] Get sync status error:", error)
    return NextResponse.json({ error: "Failed to get sync status" }, { status: 500 })
  }
}

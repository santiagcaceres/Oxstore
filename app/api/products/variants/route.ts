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
      .select("id, zureo_data, name, price")
      .eq("zureo_code", zureoCode)
      .single()

    if (productError || !product) {
      console.error("Product not found:", productError)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    let variants = []

    try {
      const zureoData = typeof product.zureo_data === "string" ? JSON.parse(product.zureo_data) : product.zureo_data

      console.log(`[v0] Analyzing zureo_data for variants:`, zureoData)

      // Buscar variantes en diferentes estructuras posibles
      let varietiesData = []

      if (zureoData.originalProduct?.variedades) {
        varietiesData = zureoData.originalProduct.variedades
      } else if (zureoData.varieties) {
        varietiesData = zureoData.varieties
      } else if (zureoData.variantes) {
        varietiesData = zureoData.variantes
      }

      console.log(`[v0] Found ${varietiesData.length} varieties in zureo_data`)

      if (varietiesData.length > 0) {
        // Procesar variantes desde zureo_data
        variants = varietiesData
          .filter((variety: any) => (variety.stock || 0) > 0)
          .map((variety: any, index: number) => {
            let color = null
            let size = null

            // Extraer atributos de color y talle
            if (variety.atributos && Array.isArray(variety.atributos)) {
              for (const attr of variety.atributos) {
                const atributoName = attr.atributo?.toLowerCase() || ""
                const valor = attr.valor || ""

                if (atributoName.includes("color") || atributoName.includes("colour")) {
                  color = valor
                } else if (
                  atributoName.includes("talle") ||
                  atributoName.includes("size") ||
                  atributoName.includes("talla")
                ) {
                  size = valor
                }
              }
            }

            // Si no hay atributos, intentar extraer del nombre
            if (!color && !size && variety.nombre) {
              const nombre = variety.nombre.toLowerCase()
              // Buscar patrones comunes de talle
              const sizePatterns = /\b(xs|s|m|l|xl|xxl|\d+)\b/i
              const sizeMatch = nombre.match(sizePatterns)
              if (sizeMatch) {
                size = sizeMatch[0].toUpperCase()
              }
            }

            const originalPrice = variety.precio || product.price || 0
            const finalPrice = Math.round(originalPrice * 1.22)

            return {
              id: variety.id || `variant-${index}`,
              color: color || "Sin especificar",
              size: size || "Único",
              stock_quantity: variety.stock || 0,
              price: finalPrice,
              variety_name: variety.nombre || `${color || ""} ${size || ""}`.trim() || "Variante",
              zureo_variety_id: variety.id,
              original_price: originalPrice,
              images: variety.imagenes || [],
            }
          })
      } else {
        // Si no hay variantes específicas, crear una variante básica
        const originalPrice = product.price || 0
        const finalPrice = Math.round(originalPrice * 1.22)

        variants = [
          {
            id: "basic-variant",
            color: "Sin especificar",
            size: "Único",
            stock_quantity: zureoData.originalProduct?.stock || 1,
            price: finalPrice,
            variety_name: "Estándar",
            zureo_variety_id: null,
            original_price: originalPrice,
            images: zureoData.originalProduct?.imagenes || [],
          },
        ]
      }
    } catch (parseError) {
      console.error("Error parsing zureo_data:", parseError)
      // Fallback: buscar en product_variants si existe
      const { data: dbVariants } = await supabase
        .from("product_variants")
        .select("id, color, size, stock_quantity, price, variety_name, zureo_variety_id")
        .eq("product_id", product.id)
        .gt("stock_quantity", 0)
        .order("id", { ascending: true })

      variants = dbVariants || []
    }

    console.log(`[v0] Found ${variants.length} variants for product ${product.id}`)
    console.log(`[v0] Variants:`, variants)

    return NextResponse.json(variants)
  } catch (error) {
    console.error("Error in variants API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

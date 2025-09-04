import { NextResponse } from "next/server"
import { zureoAPI } from "@/lib/zureo-api"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("[v0] GET /api/zureo/categories - Starting request")

    const rubros = await zureoAPI.getProductTypes()

    console.log(`[v0] GET /api/zureo/categories - Successfully fetched ${rubros.length} rubros`)

    const categories = [
      {
        id: 1,
        nombre: "Vestimenta",
        slug: "vestimenta",
        subcategorias: [
          { id: 1, nombre: "Remeras", slug: "remeras" },
          { id: 2, nombre: "Camisas", slug: "camisas" },
          { id: 3, nombre: "Blusas", slug: "blusas" },
          { id: 4, nombre: "Buzos", slug: "buzos" },
          { id: 5, nombre: "Canguros", slug: "canguros" },
          { id: 6, nombre: "Camperas", slug: "camperas" },
          { id: 7, nombre: "Chalecos", slug: "chalecos" },
          { id: 8, nombre: "Abrigos", slug: "abrigos" },
          { id: 9, nombre: "Jeans", slug: "jeans" },
          { id: 10, nombre: "Polleras", slug: "polleras" },
          { id: 11, nombre: "Pantalones", slug: "pantalones" },
          { id: 12, nombre: "Vestidos", slug: "vestidos" },
          { id: 13, nombre: "Enteritos", slug: "enteritos" },
          { id: 14, nombre: "Deportivos", slug: "deportivos" },
        ],
      },
      {
        id: 2,
        nombre: "Calzado",
        slug: "calzado",
        subcategorias: [
          { id: 15, nombre: "Zapatillas", slug: "zapatillas" },
          { id: 16, nombre: "Zapatos", slug: "zapatos" },
          { id: 17, nombre: "Botas", slug: "botas" },
          { id: 18, nombre: "Sandalias", slug: "sandalias" },
          { id: 19, nombre: "Ojotas", slug: "ojotas" },
        ],
      },
      {
        id: 3,
        nombre: "Accesorios",
        slug: "accesorios",
        subcategorias: [
          { id: 20, nombre: "Carteras", slug: "carteras" },
          { id: 21, nombre: "Mochilas", slug: "mochilas" },
          { id: 22, nombre: "Cinturones", slug: "cinturones" },
          { id: 23, nombre: "Gorros", slug: "gorros" },
          { id: 24, nombre: "Anteojos", slug: "anteojos" },
          { id: 25, nombre: "Relojes", slug: "relojes" },
        ],
      },
    ]

    return NextResponse.json({
      success: true,
      categories,
      zureoRubros: rubros,
      timestamp: new Date().toISOString(),
      endpoint: "https://api.zureo.com/sdk/v1/product_type/all",
    })
  } catch (error) {
    console.error("[v0] GET /api/zureo/categories - Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener categorías",
        timestamp: new Date().toISOString(),
        endpoint: "https://api.zureo.com/sdk/v1/product_type/all",
      },
      { status: 500 },
    )
  }
}

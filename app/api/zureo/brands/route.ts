import { NextResponse } from "next/server"
import { getBrandsFromZureo } from "@/lib/zureo-api"

export async function GET() {
  try {
    const brands = await getBrandsFromZureo()

    const transformedBrands = brands.map((brand: any) => ({
      id: brand.id || brand.nombre || brand.name,
      name: brand.nombre || brand.name,
      nombre: brand.nombre || brand.name, // Para compatibilidad con el header
      description: brand.descripcion || brand.description || "",
      active: brand.activo !== false && brand.active !== false,
      activo: brand.activo !== false && brand.active !== false, // Para compatibilidad con el header
      productCount: brand.productCount || 0,
    }))

    return NextResponse.json(transformedBrands)
  } catch (error) {
    console.warn("Error fetching brands from Zureo:", error)
    return NextResponse.json([]) // Return empty array instead of error
  }
}

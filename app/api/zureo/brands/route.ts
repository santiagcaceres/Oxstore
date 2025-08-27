import { NextResponse } from "next/server"
import { ZureoAPI } from "@/lib/api"

export async function GET() {
  try {
    const zureoAPI = new ZureoAPI()
    const brands = await zureoAPI.getBrands()

    return NextResponse.json({
      success: true,
      brands: brands.map((brand) => ({
        id: brand.id,
        nombre: brand.nombre,
        slug: brand.nombre
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, ""),
      })),
    })
  } catch (error) {
    console.error("Error fetching brands:", error)
    return NextResponse.json({ success: false, error: "Error al obtener marcas" }, { status: 500 })
  }
}

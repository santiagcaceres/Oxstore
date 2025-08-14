import { NextResponse } from "next/server"
import { getProductsFromZureo, getBrandsFromZureo, getZureoToken } from "@/lib/zureo-api"

export async function GET() {
  try {
    // Verificar variables de entorno
    const requiredEnvs = ["ZUREO_API_USER", "ZUREO_API_PASSWORD", "ZUREO_DOMAIN", "ZUREO_COMPANY_ID"]
    const missingEnvs = requiredEnvs.filter((env) => !process.env[env])

    if (missingEnvs.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Variables faltantes: ${missingEnvs.join(", ")}`,
      })
    }

    try {
      // Test authentication
      const token = await getZureoToken()

      // Test products endpoint
      const products = await getProductsFromZureo({ qty: 1 })

      // Test brands endpoint
      const brands = await getBrandsFromZureo()

      return NextResponse.json({
        success: true,
        message: "Conexión exitosa con Zureo API",
        productCount: products?.length || 0,
        brandCount: brands?.length || 0,
        timestamp: new Date().toISOString(),
      })
    } catch (apiError) {
      return NextResponse.json({
        success: false,
        error: `Error de API Zureo: ${apiError instanceof Error ? apiError.message : "Error desconocido"}`,
      })
    }
  } catch (error) {
    console.error("Error testing Zureo API:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

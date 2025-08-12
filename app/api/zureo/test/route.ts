import { NextResponse } from "next/server"

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

    // Crear credenciales de autenticación
    const credentials = Buffer.from(`${process.env.ZUREO_API_USER}:${process.env.ZUREO_API_PASSWORD}`).toString(
      "base64",
    )

    // Probar conexión con productos
    const productResponse = await fetch(
      `https://${process.env.ZUREO_DOMAIN}/api/productos?empresa=${process.env.ZUREO_COMPANY_ID}&limit=1`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!productResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `Error HTTP ${productResponse.status}: ${productResponse.statusText}`,
      })
    }

    const productData = await productResponse.json()

    // Probar conexión con marcas
    const brandResponse = await fetch(
      `https://${process.env.ZUREO_DOMAIN}/api/marcas?empresa=${process.env.ZUREO_COMPANY_ID}`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      },
    )

    const brandData = brandResponse.ok ? await brandResponse.json() : { data: [] }

    return NextResponse.json({
      success: true,
      message: "Conexión exitosa con Zureo API",
      productCount: productData.data?.length || 0,
      brandCount: brandData.data?.length || 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error testing Zureo API:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

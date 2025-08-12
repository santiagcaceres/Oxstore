import { NextResponse } from "next/server"
import { getBrandsFromZureo, getProductsFromZureo } from "@/lib/zureo-api"

async function testZureoConnection() {
  // Función interna para obtener token usando la misma lógica
  const user = process.env.ZUREO_API_USER
  const pass = process.env.ZUREO_API_PASSWORD
  const domain = process.env.ZUREO_DOMAIN

  if (!user || !pass || !domain) {
    throw new Error("Credenciales de Zureo no configuradas")
  }

  const credentials = `${user}:${pass}:${domain}`
  const encodedCredentials = Buffer.from(credentials).toString("base64")

  const response = await fetch("https://api.zureo.com/sdk/v1/security/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodedCredentials}`,
    },
    body: "{}",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error de autenticación: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.token
}

export async function GET() {
  try {
    console.log("🔍 Iniciando diagnóstico de conexión con Zureo...")

    // Verificar variables de entorno
    const requiredVars = ["ZUREO_API_USER", "ZUREO_API_PASSWORD", "ZUREO_DOMAIN", "ZUREO_COMPANY_ID"]
    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Variables de entorno faltantes: ${missingVars.join(", ")}`,
          step: "environment_check",
        },
        { status: 400 },
      )
    }

    console.log("✅ Variables de entorno encontradas")

    // Paso 1: Probar autenticación
    console.log("🔐 Probando autenticación...")
    const token = await testZureoConnection()
    console.log("✅ Token obtenido exitosamente")

    // Paso 2: Probar obtener marcas
    console.log("🏷️ Probando obtener marcas...")
    const brands = await getBrandsFromZureo()
    console.log(`✅ Marcas obtenidas: ${brands?.length || 0}`)

    // Paso 3: Probar obtener productos (solo algunos)
    console.log("📦 Probando obtener productos...")
    const products = await getProductsFromZureo({ qty: 10 })
    console.log(`✅ Productos obtenidos: ${products?.length || 0}`)

    return NextResponse.json({
      success: true,
      message: "Conexión con Zureo exitosa",
      data: {
        token_valid: !!token,
        brands_count: brands?.length || 0,
        products_count: products?.length || 0,
        sample_brand: brands?.[0]?.descripcion || "N/A",
        sample_product: products?.[0]?.descripcion || "N/A",
      },
    })
  } catch (error: any) {
    console.error("❌ Error en diagnóstico Zureo:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
        details: {
          name: error.name,
          stack: error.stack?.split("\n").slice(0, 3).join("\n"),
        },
      },
      { status: 500 },
    )
  }
}

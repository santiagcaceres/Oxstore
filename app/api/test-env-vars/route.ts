import { NextResponse } from "next/server"

export async function GET() {
  try {
    const requiredVars = ["ZUREO_API_USER", "ZUREO_API_PASSWORD", "ZUREO_DOMAIN", "ZUREO_COMPANY_ID"]
    const missing = []
    const configured = {}

    for (const varName of requiredVars) {
      const value = process.env[varName]
      if (!value) {
        missing.push(varName)
      } else {
        configured[varName] = varName.includes("PASSWORD") ? "***" : value
      }
    }

    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Faltan ${missing.length} variables de entorno`,
        details: {
          missing,
          configured,
          allConfigured: false,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Todas las variables de entorno están configuradas",
      details: {
        configured,
        allConfigured: true,
        missing: [],
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error verificando variables de entorno",
      details: { error: String(error) },
    })
  }
}

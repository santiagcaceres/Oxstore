import { NextResponse } from "next/server"

export async function GET() {
  try {
    const requiredVars = ["ZUREO_API_USER", "ZUREO_API_PASSWORD", "ZUREO_DOMAIN", "ZUREO_COMPANY_ID"]

    const missing = requiredVars.filter((varName) => !process.env[varName])
    const configured = requiredVars.filter((varName) => !!process.env[varName])

    return NextResponse.json({
      success: missing.length === 0,
      message:
        missing.length === 0
          ? "Todas las variables de entorno están configuradas"
          : `Faltan ${missing.length} variables de entorno`,
      details: {
        configured,
        missing,
        allConfigured: missing.length === 0,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error verificando variables de entorno",
      details: { error: error instanceof Error ? error.message : "Error desconocido" },
    })
  }
}

import { NextResponse } from "next/server"

export async function GET() {
  const requiredVars = ["ZUREO_API_USER", "ZUREO_API_PASSWORD", "ZUREO_DOMAIN", "ZUREO_COMPANY_ID"]

  const envStatus = requiredVars.map((varName) => ({
    name: varName,
    configured: !!process.env[varName],
    value: process.env[varName] ? "***configurada***" : "NO CONFIGURADA",
  }))

  const missing = envStatus.filter((env) => !env.configured).map((env) => env.name)
  const allConfigured = missing.length === 0

  return NextResponse.json({
    allConfigured,
    missing,
    envStatus,
    message: allConfigured
      ? "Todas las variables están configuradas correctamente"
      : `Faltan ${missing.length} variables de entorno`,
  })
}

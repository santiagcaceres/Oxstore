import { NextResponse } from "next/server"

export async function GET() {
  try {
    const requiredVars = ["ZUREO_API_USER", "ZUREO_API_PASSWORD", "ZUREO_DOMAIN", "ZUREO_COMPANY_ID"]

    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Faltan las siguientes variables de entorno: ${missingVars.join(", ")}`,
        details: {
          missing: missingVars,
          available: requiredVars.filter((varName) => process.env[varName]),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Todas las variables de entorno están configuradas correctamente",
      details: {
        variables: requiredVars.map((varName) => ({
          name: varName,
          configured: !!process.env[varName],
          value: process.env[varName] ? `${process.env[varName]?.substring(0, 3)}***` : null,
        })),
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error al verificar variables de entorno",
      details: { error: String(error) },
    })
  }
}

import { NextResponse } from "next/server"
import { Buffer } from "buffer"

async function getZureoToken() {
  const user = process.env.ZUREO_API_USER
  const pass = process.env.ZUREO_API_PASSWORD
  const domain = process.env.ZUREO_DOMAIN

  if (!user || !pass || !domain) {
    throw new Error("Faltan credenciales de Zureo")
  }

  const credentials = `${user}:${pass}:${domain}`
  const encodedCredentials = Buffer.from(credentials).toString("base64")

  const response = await fetch("https://api.zureo.com/sdk/v1/security/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodedCredentials}`,
    },
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error?.message || data.error || "Error de autenticación")
  }

  return data.token
}

export async function GET() {
  try {
    const token = await getZureoToken()

    console.log("Obteniendo empresas con token:", token ? "Token válido" : "Sin token")

    const response = await fetch("https://api.zureo.com/sdk/v1/company/all", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    console.log("Respuesta de empresas:", data)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error?.message || data.error || "Error al obtener empresas",
          details: data,
          statusCode: response.status,
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      companies: data.companies || data,
      count: data.companies?.length || (Array.isArray(data) ? data.length : 0),
      message: `Se encontraron ${data.companies?.length || 0} empresas`,
    })
  } catch (error) {
    console.error("Error obteniendo empresas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener empresas",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

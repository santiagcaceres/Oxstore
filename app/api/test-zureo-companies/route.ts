import { NextResponse } from "next/server"
import { Buffer } from "buffer"

async function getZureoToken() {
  const user = process.env.ZUREO_API_USER
  const password = process.env.ZUREO_API_PASSWORD
  const domain = process.env.ZUREO_DOMAIN

  if (!user || !password || !domain) {
    throw new Error("Faltan credenciales de Zureo")
  }

  const credentials = `${user}:${password}:${domain}`
  const encodedCredentials = Buffer.from(credentials).toString("base64")

  const response = await fetch("https://api.zureo.com/sdk/v1/security/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodedCredentials}`,
    },
    body: "{}", // Body vacío como indica la guía
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
    const token = await getZureoToken()

    console.log("Obteniendo empresas con token:", token ? "Token válido" : "Sin token")

    const response = await fetch("https://api.zureo.com/sdk/v1/company/all", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Companies response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Companies error:", errorText)

      return NextResponse.json({
        success: false,
        message: `Error al obtener empresas: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          error: errorText,
          tokenUsed: token ? token.substring(0, 20) + "..." : "No token",
        },
      })
    }

    const data = await response.json()
    console.log("Companies data:", data)

    // La respuesta puede venir en data o directamente
    const companies = data.data || data
    const companiesArray = Array.isArray(companies) ? companies : [companies]

    return NextResponse.json({
      success: true,
      message: `Se encontraron ${companiesArray.length} empresas disponibles`,
      details: {
        companies: companiesArray,
        count: companiesArray.length,
        configuredCompanyId: process.env.ZUREO_COMPANY_ID,
        rawResponse: data,
      },
    })
  } catch (error) {
    console.error("Error obteniendo empresas:", error)
    return NextResponse.json({
      success: false,
      message: "Error al obtener empresas",
      details: {
        error: String(error),
        type: "api_error",
      },
    })
  }
}

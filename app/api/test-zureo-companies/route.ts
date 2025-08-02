import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = process.env.ZUREO_API_USER
    const password = process.env.ZUREO_API_PASSWORD
    const domain = process.env.ZUREO_DOMAIN

    if (!user || !password || !domain) {
      return NextResponse.json({
        success: false,
        message: "Faltan credenciales de Zureo",
      })
    }

    const authString = Buffer.from(`${user}:${password}`).toString("base64")

    const response = await fetch(`https://api.zureo.com/sdk/v1/company/all`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
        "X-Domain": domain,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        message: `Error al obtener empresas: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          error: errorText,
        },
      })
    }

    const companies = await response.json()

    return NextResponse.json({
      success: true,
      message: `Se encontraron ${companies.length} empresas disponibles`,
      details: {
        companies: companies,
        configuredCompanyId: process.env.ZUREO_COMPANY_ID,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error al obtener empresas",
      details: { error: String(error) },
    })
  }
}

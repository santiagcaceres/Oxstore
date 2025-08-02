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
    const companyId = process.env.ZUREO_COMPANY_ID

    console.log("Obteniendo productos para empresa:", companyId)

    // Usar el formato exacto de la guía
    const url = `https://api.zureo.com/sdk/v1/product/all?emp=${companyId || "1"}&qty=10`

    console.log("URL de productos:", url)

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Products response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Products error:", errorText)

      return NextResponse.json({
        success: false,
        message: `Error al obtener productos: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          error: errorText,
          companyId: companyId,
          url: url,
          tokenUsed: token ? token.substring(0, 20) + "..." : "No token",
        },
      })
    }

    const data = await response.json()
    console.log("Products data sample:", Array.isArray(data) ? `Array with ${data.length} items` : typeof data)

    // La respuesta puede venir en data o directamente
    const products = data.data || data
    const productsArray = Array.isArray(products) ? products : []

    return NextResponse.json({
      success: true,
      message: `Se encontraron ${productsArray.length} productos en el catálogo`,
      details: {
        totalProducts: productsArray.length,
        sampleProducts: productsArray.slice(0, 3),
        companyId: companyId,
        dataStructure: Array.isArray(data) ? "direct_array" : "object_with_data_key",
        rawResponse: data,
      },
    })
  } catch (error) {
    console.error("Error obteniendo productos:", error)
    return NextResponse.json({
      success: false,
      message: "Error al obtener productos",
      details: {
        error: String(error),
        type: "api_error",
      },
    })
  }
}

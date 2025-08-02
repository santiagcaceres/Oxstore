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
    const companyId = process.env.ZUREO_COMPANY_ID

    console.log("Obteniendo productos para empresa:", companyId)

    const url = new URL("https://api.zureo.com/sdk/v1/product/all")
    url.searchParams.set("emp", companyId || "1")
    url.searchParams.set("qty", "10") // Limitar a 10 productos para la prueba

    console.log("URL de productos:", url.toString())

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    console.log("Respuesta de productos:", data)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error?.message || data.error || "Error al obtener productos",
          details: data,
          statusCode: response.status,
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      products: data.products || data,
      count: data.products?.length || (Array.isArray(data) ? data.length : 0),
      sample: (data.products || data)?.slice(0, 3) || [],
      message: `Se encontraron ${data.products?.length || 0} productos`,
    })
  } catch (error) {
    console.error("Error obteniendo productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener productos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

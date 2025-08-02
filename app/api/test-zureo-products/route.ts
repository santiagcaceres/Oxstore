import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = process.env.ZUREO_API_USER
    const password = process.env.ZUREO_API_PASSWORD
    const domain = process.env.ZUREO_DOMAIN
    const companyId = process.env.ZUREO_COMPANY_ID

    if (!user || !password || !domain || !companyId) {
      return NextResponse.json({
        success: false,
        message: "Faltan credenciales de Zureo o ID de empresa",
      })
    }

    const authString = Buffer.from(`${user}:${password}`).toString("base64")

    const response = await fetch(`https://api.zureo.com/sdk/v1/product/all?emp=${companyId}`, {
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
        message: `Error al obtener productos: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          error: errorText,
          companyId: companyId,
        },
      })
    }

    const products = await response.json()

    return NextResponse.json({
      success: true,
      message: `Se encontraron ${products.length} productos en el catálogo`,
      details: {
        totalProducts: products.length,
        sampleProducts: products.slice(0, 3), // Mostrar solo los primeros 3 como muestra
        companyId: companyId,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error al obtener productos",
      details: { error: String(error) },
    })
  }
}

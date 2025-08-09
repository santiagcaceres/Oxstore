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
        message: "Variables de entorno de Zureo no configuradas",
      })
    }

    const credentials = Buffer.from(`${user}:${password}`).toString("base64")
    const url = `https://${domain}/api/productos?empresa_id=${companyId}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: `Error HTTP: ${response.status}`,
      })
    }

    const data = await response.json()

    // Filter products that have a brand assigned (marca.nombre != null)
    const brandedProducts = data.filter(
      (product: any) => product.marca && product.marca.nombre !== null && product.marca.nombre !== "",
    )

    return NextResponse.json({
      success: true,
      message: `${brandedProducts.length} productos con marca encontrados`,
      products: brandedProducts,
      total: data.length,
    })
  } catch (error) {
    console.error("Error fetching branded products:", error)
    return NextResponse.json({
      success: false,
      message: "Error al obtener productos con marca",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

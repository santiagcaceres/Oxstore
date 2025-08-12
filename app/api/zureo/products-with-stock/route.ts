import { NextResponse } from "next/server"

const ZUREO_API_BASE = "https://api.zureo.com/sdk/v1"

async function getZureoToken() {
  const user = process.env.ZUREO_API_USER
  const password = process.env.ZUREO_API_PASSWORD
  const domain = process.env.ZUREO_DOMAIN

  if (!user || !password || !domain) {
    throw new Error("Credenciales de Zureo no configuradas")
  }

  const credentials = Buffer.from(`${user}:${password}:${domain}`).toString("base64")

  const response = await fetch(`${ZUREO_API_BASE}/security/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error de autenticación: ${response.status}`)
  }

  const data = await response.json()
  return data.token
}

export async function GET() {
  try {
    const token = await getZureoToken()
    const companyId = process.env.ZUREO_COMPANY_ID || "1"

    // Obtener productos
    const productsResponse = await fetch(`${ZUREO_API_BASE}/products?companyId=${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!productsResponse.ok) {
      throw new Error(`Error al obtener productos: ${productsResponse.status}`)
    }

    const productsData = await productsResponse.json()

    // Filtrar productos con stock > 0 y transformar datos
    const productsWithStock = (productsData.data || [])
      .filter((product: any) => product.stock > 0)
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        code: product.code,
        brand: product.brand || "Sin marca",
        stock: product.stock,
        price: product.price || 0,
        category: product.category || "Sin categoría",
        active: product.active !== false,
      }))

    return NextResponse.json({
      success: true,
      products: productsWithStock,
      total: productsWithStock.length,
      totalStock: productsWithStock.reduce((sum: number, p: any) => sum + p.stock, 0),
    })
  } catch (error) {
    console.error("Error en products-with-stock:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        products: [],
      },
      { status: 500 },
    )
  }
}

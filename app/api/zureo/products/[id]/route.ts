import { NextResponse } from "next/server"
import { zureoAPI } from "@/lib/zureo-api"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`[v0] GET /api/zureo/products/${params.id} - Starting request`)

    const products = await zureoAPI.getAllProducts()
    const product = products.find((p) => p.id.toString() === params.id)

    if (!product) {
      console.log(`[v0] GET /api/zureo/products/${params.id} - Product not found`)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log(`[v0] GET /api/zureo/products/${params.id} - Product found: ${product.nombre}`)

    return NextResponse.json({
      product,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[v0] GET /api/zureo/products/${params.id} - Error:`, error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al obtener producto",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { local_images, local_description, local_price, is_featured } = body

    // Here you would save the local customizations to your database
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: "Configuración local guardada correctamente",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

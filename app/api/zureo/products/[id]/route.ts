import { NextResponse } from "next/server"
import { ZureoAPI } from "@/lib/api"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const zureoApi = new ZureoAPI()
    const products = await zureoApi.getAllProducts()
    const product = products.find((p) => p.id.toString() === params.id)

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
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

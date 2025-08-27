import { NextResponse } from "next/server"
import { zureoAPI } from "@/lib/api"

export async function POST() {
  try {
    const success = await zureoAPI.syncProducts()

    if (success) {
      return NextResponse.json({
        message: "Productos sincronizados exitosamente",
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json({ error: "Error al sincronizar productos" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in sync-products:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

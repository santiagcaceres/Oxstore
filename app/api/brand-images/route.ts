import { NextResponse } from "next/server"

// Simulamos una base de datos en memoria para las imágenes de marcas
const brandImages: any[] = []

export async function GET() {
  try {
    return NextResponse.json(brandImages)
  } catch (error) {
    console.error("Error fetching brand images:", error)
    return NextResponse.json({ error: "Error fetching brand images" }, { status: 500 })
  }
}

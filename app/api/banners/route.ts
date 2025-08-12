import { type NextRequest, NextResponse } from "next/server"

// Simulamos una base de datos en memoria para los banners
const banners: any[] = [
  {
    id: "1",
    title: "Colección Verano 2024",
    description: "Descubre las últimas tendencias en moda de verano",
    imageUrl: "/placeholder.svg?height=600&width=1920",
    link: "/nuevo",
    position: "hero",
    active: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
]

export async function GET() {
  try {
    return NextResponse.json(banners.sort((a, b) => a.order - b.order))
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ error: "Error fetching banners" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const newBanner = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    }

    banners.push(newBanner)

    return NextResponse.json(newBanner, { status: 201 })
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json({ error: "Error creating banner" }, { status: 500 })
  }
}

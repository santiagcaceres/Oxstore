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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const bannerIndex = banners.findIndex((b) => b.id === params.id)

    if (bannerIndex === -1) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    banners[bannerIndex] = { ...banners[bannerIndex], ...data }

    return NextResponse.json(banners[bannerIndex])
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json({ error: "Error updating banner" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bannerIndex = banners.findIndex((b) => b.id === params.id)

    if (bannerIndex === -1) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    banners.splice(bannerIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json({ error: "Error deleting banner" }, { status: 500 })
  }
}

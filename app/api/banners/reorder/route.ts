import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const { banners: reorderedBanners } = await request.json()

    // Por ahora solo devolvemos éxito ya que estamos usando memoria

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering banners:", error)
    return NextResponse.json({ error: "Error reordering banners" }, { status: 500 })
  }
}

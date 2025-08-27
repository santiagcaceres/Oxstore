import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const banners = await Database.getBanners()
    const banner = banners.find((b) => b.id === Number.parseInt(params.id))

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json(banner)
  } catch (error) {
    console.error("Error fetching banner:", error)
    return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // In a real app, update the banner in the database
    // For now, return success response
    return NextResponse.json({
      message: "Banner updated successfully",
      banner: { id: Number.parseInt(params.id), ...body },
    })
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // In a real app, delete the banner from the database
    // For now, return success response
    return NextResponse.json({ message: "Banner deleted successfully" })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 })
  }
}

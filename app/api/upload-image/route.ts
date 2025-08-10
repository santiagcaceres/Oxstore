import { put } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")
  const type = searchParams.get("type") || "generic" // 'banner', 'brand', etc.

  if (!request.body || !filename) {
    return NextResponse.json({ message: "No file or filename provided." }, { status: 400 })
  }

  const blob = await put(`${type}/${filename}`, request.body, {
    access: "public",
  })

  return NextResponse.json(blob)
}

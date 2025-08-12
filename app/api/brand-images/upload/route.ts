import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

// Simulamos una base de datos en memoria para las imágenes de marcas
const brandImages: any[] = []

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const brandName = formData.get("brandName") as string

    if (!file || !brandName) {
      return NextResponse.json({ error: "File and brand name are required" }, { status: 400 })
    }

    // Subir imagen a Vercel Blob
    const blob = await put(`brands/${brandName}-${Date.now()}.${file.name.split(".").pop()}`, file, {
      access: "public",
    })

    // Guardar referencia en nuestra "base de datos"
    const existingIndex = brandImages.findIndex((img) => img.brandName === brandName)
    const brandImage = {
      id: Date.now().toString(),
      brandName,
      imageUrl: blob.url,
      uploadedAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      brandImages[existingIndex] = brandImage
    } else {
      brandImages.push(brandImage)
    }

    return NextResponse.json(brandImage, { status: 201 })
  } catch (error) {
    console.error("Error uploading brand image:", error)
    return NextResponse.json({ error: "Error uploading brand image" }, { status: 500 })
  }
}

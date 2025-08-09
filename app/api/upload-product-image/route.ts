import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const productCode = formData.get("productCode") as string

    if (!file || !productCode) {
      return NextResponse.json({ success: false, error: "Archivo o código de producto faltante" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Solo se permiten imágenes" }, { status: 400 })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `products/${productCode}/${timestamp}.${extension}`

    // Subir a Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: filename,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

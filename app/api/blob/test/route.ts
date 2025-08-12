import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        success: false,
        error: "BLOB_READ_WRITE_TOKEN no está configurado",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Vercel Blob configurado correctamente",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

import { NextResponse } from "next/server"
import { getZureoToken } from "@/lib/zureo-api"

export async function GET() {
  try {
    const token = await getZureoToken()

    return NextResponse.json({
      success: true,
      message: "Token obtenido correctamente",
      tokenLength: token.length,
      tokenPreview: `${token.substring(0, 20)}...`,
    })
  } catch (error) {
    console.error("Error testing Zureo token:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { Buffer } from "buffer"

export async function GET() {
  try {
    const user = process.env.ZUREO_API_USER
    const password = process.env.ZUREO_API_PASSWORD
    const domain = process.env.ZUREO_DOMAIN

    if (!user || !password || !domain) {
      return NextResponse.json({
        success: false,
        message: "Variables de entorno de Zureo no configuradas",
        details: { status: 400 },
      })
    }

    const credentials = `${user}:${password}:${domain}`
    const encodedCredentials = Buffer.from(credentials).toString("base64")

    const response = await fetch("https://api.zureo.com/sdk/v1/security/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
      body: "{}",
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        message: `Error de autenticación: ${response.status}`,
        details: {
          status: response.status,
          error: errorText,
          credentials: `${user}:***:${domain}`,
        },
      })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Autenticación exitosa con Zureo",
      details: {
        token_received: !!data.token,
        valid_to: data.valid_to,
        user: user,
        domain: domain,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error de conexión con Zureo API",
      details: { error: error instanceof Error ? error.message : "Error desconocido" },
    })
  }
}

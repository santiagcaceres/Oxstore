import { NextResponse } from "next/server"
import { Buffer } from "buffer"

export async function GET() {
  try {
    const user = process.env.ZUREO_API_USER
    const pass = process.env.ZUREO_API_PASSWORD
    const domain = process.env.ZUREO_DOMAIN

    if (!user || !pass || !domain) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan credenciales de Zureo en las variables de entorno",
          missing: {
            user: !user,
            password: !pass,
            domain: !domain,
          },
        },
        { status: 500 },
      )
    }

    const credentials = `${user}:${pass}:${domain}`
    const encodedCredentials = Buffer.from(credentials).toString("base64")

    console.log("Intentando autenticación con Zureo...")
    console.log("Usuario:", user)
    console.log("Dominio:", domain)

    const response = await fetch("https://api.zureo.com/sdk/v1/security/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
    })

    const data = await response.json()
    console.log("Respuesta de Zureo:", data)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error?.message || data.error || "Error de autenticación",
          details: data,
          statusCode: response.status,
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Autenticación exitosa",
      token: data.token ? "Token obtenido correctamente" : "Sin token",
      valid_to: data.valid_to,
      user_info: data.user || "Sin información de usuario",
    })
  } catch (error) {
    console.error("Error en autenticación:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error de conexión con la API de Zureo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

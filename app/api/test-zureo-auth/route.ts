import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = process.env.ZUREO_API_USER
    const password = process.env.ZUREO_API_PASSWORD
    const domain = process.env.ZUREO_DOMAIN

    if (!user || !password || !domain) {
      return NextResponse.json({
        success: false,
        message: "Faltan credenciales de Zureo en las variables de entorno",
      })
    }

    const authString = Buffer.from(`${user}:${password}`).toString("base64")

    const response = await fetch(`https://api.zureo.com/sdk/v1/auth`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
        "X-Domain": domain,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        message: `Error de autenticación: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          credentials: {
            user: user?.substring(0, 5) + "***",
            domain: domain,
          },
        },
      })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Autenticación exitosa con Zureo",
      details: data,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error al conectar con Zureo",
      details: { error: String(error) },
    })
  }
}

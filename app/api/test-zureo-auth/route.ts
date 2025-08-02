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
        message: "Faltan credenciales de Zureo en las variables de entorno",
        details: {
          hasUser: !!user,
          hasPassword: !!password,
          hasDomain: !!domain,
        },
      })
    }

    // Formato exacto según la guía: usuario:contraseña:dominio
    const credentials = `${user}:${password}:${domain}`
    const encodedCredentials = Buffer.from(credentials).toString("base64")

    console.log("Intentando autenticación con Zureo...")
    console.log("Usuario:", user)
    console.log("Dominio:", domain)
    console.log("Credentials format:", `${user}:***:${domain}`)
    console.log("Base64 encoded:", encodedCredentials)

    const response = await fetch("https://api.zureo.com/sdk/v1/security/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
      body: "{}", // Body vacío como indica la guía
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)

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
            format: `${user}:***:${domain}`,
            base64: encodedCredentials.substring(0, 20) + "...",
          },
        },
      })
    }

    const data = await response.json()
    console.log("Auth success:", data)

    return NextResponse.json({
      success: true,
      message: "Autenticación exitosa con Zureo",
      details: {
        tokenReceived: !!data.token,
        authType: data.auth_type,
        validTo: data.valid_to,
        tokenPreview: data.token ? data.token.substring(0, 20) + "..." : "No token",
      },
    })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({
      success: false,
      message: "Error al conectar con Zureo",
      details: {
        error: String(error),
        type: "connection_error",
      },
    })
  }
}

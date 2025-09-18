export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("[v0] Starting token debug process")

    // Verificar variables de entorno
    const apiUrl = process.env.ZUREO_API_URL || "https://api.zureo.com"
    const username = process.env.ZUREO_USERNAME
    const password = process.env.ZUREO_PASSWORD
    const domain = process.env.ZUREO_DOMAIN

    console.log("[v0] Environment variables:", {
      apiUrl,
      username: username ? "SET" : "NOT SET",
      password: password ? "SET" : "NOT SET",
      domain: domain ? "SET" : "NOT SET",
    })

    if (!username || !password || !domain) {
      return Response.json({
        success: false,
        error: "Missing environment variables",
        details: {
          username: username ? "SET" : "MISSING",
          password: password ? "SET" : "MISSING",
          domain: domain ? "SET" : "MISSING",
        },
      })
    }

    // Crear credenciales Basic Auth
    const credentials = `${username}:${password}:${domain}`
    const encodedCredentials = Buffer.from(credentials).toString("base64")

    console.log("[v0] Credentials format:", credentials)
    console.log("[v0] Encoded credentials:", encodedCredentials)

    // Hacer request de autenticación
    const authUrl = `${apiUrl}/sdk/v1/security/login`
    console.log("[v0] Auth URL:", authUrl)

    const authResponse = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
    })

    console.log("[v0] Auth response status:", authResponse.status)
    console.log("[v0] Auth response headers:", Object.fromEntries(authResponse.headers.entries()))

    const authData = await authResponse.json()
    console.log("[v0] Auth response data:", authData)

    return Response.json({
      success: authResponse.ok,
      step: "Token Authentication",
      request: {
        url: authUrl,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedCredentials}`,
        },
      },
      response: {
        status: authResponse.status,
        headers: Object.fromEntries(authResponse.headers.entries()),
        data: authData,
      },
      environmentVariables: {
        apiUrl,
        username: username ? "SET" : "NOT SET",
        password: password ? "SET" : "NOT SET",
        domain: domain ? "SET" : "NOT SET",
      },
    })
  } catch (error) {
    console.error("[v0] Token debug error:", error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      step: "Token Authentication",
    })
  }
}

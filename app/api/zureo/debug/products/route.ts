export async function GET() {
  try {
    console.log("[v0] Starting products debug process")

    // Paso 1: Obtener token
    const apiUrl = process.env.ZUREO_API_URL || "https://api.zureo.com"
    const username = process.env.ZUREO_USERNAME
    const password = process.env.ZUREO_PASSWORD
    const domain = process.env.ZUREO_DOMAIN
    const companyId = process.env.ZUREO_COMPANY_ID || "1"

    if (!username || !password || !domain) {
      return Response.json({
        success: false,
        error: "Missing environment variables",
      })
    }

    // Autenticación
    const credentials = `${username}:${password}:${domain}`
    const encodedCredentials = Buffer.from(credentials).toString("base64")

    const authUrl = `${apiUrl}/sdk/v1/security/login`
    const authResponse = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
    })

    const authData = await authResponse.json()
    console.log("[v0] Auth step completed:", authData)

    if (!authResponse.ok) {
      return Response.json({
        success: false,
        error: "Authentication failed",
        authResponse: {
          status: authResponse.status,
          data: authData,
        },
      })
    }

    // Paso 2: Obtener productos
    const token = authData.token
    const productsUrl = `${apiUrl}/sdk/v1/product/all?emp=${companyId}&from=0&qty=10`

    console.log("[v0] Products URL:", productsUrl)
    console.log("[v0] Using token:", token ? "SET" : "NOT SET")

    const productsResponse = await fetch(productsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("[v0] Products response status:", productsResponse.status)

    const productsData = await productsResponse.json()
    console.log("[v0] Products response data:", productsData)

    return Response.json({
      success: productsResponse.ok,
      steps: {
        "1_authentication": {
          url: authUrl,
          status: authResponse.status,
          success: authResponse.ok,
          token: token ? "RECEIVED" : "NOT RECEIVED",
        },
        "2_products": {
          url: productsUrl,
          status: productsResponse.status,
          success: productsResponse.ok,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token ? token.substring(0, 20) + "..." : "NO TOKEN"}`,
          },
        },
      },
      finalResponse: {
        status: productsResponse.status,
        headers: Object.fromEntries(productsResponse.headers.entries()),
        data: productsData,
      },
    })
  } catch (error) {
    console.error("[v0] Products debug error:", error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      step: "Products Request",
    })
  }
}

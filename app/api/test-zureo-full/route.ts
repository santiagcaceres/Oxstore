import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test all endpoints in sequence
    const tests = [
      { name: "env-vars", url: "/api/test-env-vars" },
      { name: "auth", url: "/api/test-zureo-auth" },
      { name: "companies", url: "/api/test-zureo-companies" },
      { name: "products", url: "/api/test-zureo-products" },
      { name: "branded-products", url: "/api/test-zureo-branded-products" },
    ]

    const results = []
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    for (const test of tests) {
      try {
        const response = await fetch(`${baseUrl}${test.url}`)
        const data = await response.json()
        results.push({
          test: test.name,
          success: data.success,
          message: data.message,
        })
      } catch (error) {
        results.push({
          test: test.name,
          success: false,
          message: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
        })
      }
    }

    const allPassed = results.every((r) => r.success)

    return NextResponse.json({
      success: allPassed,
      message: allPassed
        ? "Todos los tests pasaron exitosamente"
        : `${results.filter((r) => !r.success).length} tests fallaron`,
      details: results,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error ejecutando test completo",
      details: { error: error instanceof Error ? error.message : "Error desconocido" },
    })
  }
}

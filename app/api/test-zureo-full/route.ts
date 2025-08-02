import { NextResponse } from "next/server"
import { Buffer } from "buffer"

async function getZureoToken() {
  const user = process.env.ZUREO_API_USER
  const password = process.env.ZUREO_API_PASSWORD
  const domain = process.env.ZUREO_DOMAIN

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
    throw new Error(`Auth failed: ${response.status}`)
  }

  const data = await response.json()
  return data.token
}

export async function GET() {
  try {
    const token = await getZureoToken()
    const results = {}

    // Test múltiples endpoints
    const endpoints = [
      { name: "companies", url: "https://api.zureo.com/sdk/v1/company/all" },
      { name: "products", url: "https://api.zureo.com/sdk/v1/product/all?emp=1&qty=5" },
      { name: "brands", url: "https://api.zureo.com/sdk/v1/brand/all" },
      { name: "product_types", url: "https://api.zureo.com/sdk/v1/product_type/all?emp=1" },
      { name: "payment_methods", url: "https://api.zureo.com/sdk/v1/payment/methods" },
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          results[endpoint.name] = {
            success: true,
            count: Array.isArray(data) ? data.length : Array.isArray(data.data) ? data.data.length : 1,
            sample: Array.isArray(data) ? data.slice(0, 2) : Array.isArray(data.data) ? data.data.slice(0, 2) : data,
          }
        } else {
          results[endpoint.name] = {
            success: false,
            error: `${response.status} ${response.statusText}`,
          }
        }
      } catch (error) {
        results[endpoint.name] = {
          success: false,
          error: String(error),
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Prueba completa de endpoints de Zureo",
      details: results,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error en la prueba completa",
      details: { error: String(error) },
    })
  }
}

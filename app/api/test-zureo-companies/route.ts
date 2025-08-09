import { NextResponse } from "next/server"
import { Buffer } from "buffer"
import { getCompaniesFromZureo } from "@/lib/zureo-api"

async function getZureoToken() {
  const user = process.env.ZUREO_API_USER
  const password = process.env.ZUREO_API_PASSWORD
  const domain = process.env.ZUREO_DOMAIN

  if (!user || !password || !domain) {
    throw new Error("Faltan credenciales de Zureo")
  }

  const credentials = `${user}:${password}:${domain}`
  const encodedCredentials = Buffer.from(credentials).toString("base64")

  const response = await fetch("https://api.zureo.com/sdk/v1/security/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodedCredentials}`,
    },
    body: "{}", // Body vacío como indica la guía
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error de autenticación: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.token
}

export async function GET() {
  try {
    const companies = await getCompaniesFromZureo()

    return NextResponse.json({
      success: true,
      message: `Se obtuvieron ${Array.isArray(companies) ? companies.length : 1} empresas`,
      details: companies,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error obteniendo empresas de Zureo",
      details: { error: error instanceof Error ? error.message : "Error desconocido" },
    })
  }
}

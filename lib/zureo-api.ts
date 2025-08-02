import { Buffer } from "buffer"
import type { ZureoOrder, ZureoProduct } from "@/types/zureo"

// Caché en memoria para el token de autenticación
let tokenCache = {
  token: null as string | null,
  valid_to: 0,
}

async function getZureoToken(): Promise<string> {
  const now = Date.now()
  if (tokenCache.token && tokenCache.valid_to > now + 5 * 60 * 1000) {
    return tokenCache.token
  }

  const user = process.env.ZUREO_API_USER
  const pass = process.env.ZUREO_API_PASSWORD
  const domain = process.env.ZUREO_DOMAIN

  if (!user || !pass || !domain) {
    console.error("Faltan credenciales de Zureo en las variables de entorno.")
    throw new Error("Credenciales de Zureo no configuradas.")
  }

  const credentials = `${user}:${pass}:${domain}`
  const encodedCredentials = Buffer.from(credentials).toString("base64")

  try {
    const response = await fetch("https://api.zureo.com/sdk/v1/security/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${encodedCredentials}` },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error al obtener token de Zureo:", errorData)
      throw new Error("Error de autenticación con Zureo.")
    }

    const data = await response.json()
    tokenCache = {
      token: data.token,
      valid_to: new Date(data.valid_to).getTime(),
    }
    return tokenCache.token
  } catch (error) {
    console.error("Error de red al conectar con Zureo API:", error)
    throw new Error("No se pudo conectar con la API de Zureo.")
  }
}

async function zureoFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getZureoToken()
  const companyId = process.env.ZUREO_COMPANY_ID

  if (!companyId) {
    throw new Error("El ID de la empresa de Zureo (ZUREO_COMPANY_ID) no está configurado.")
  }

  const url = new URL(`https://api.zureo.com${endpoint}`)
  if (options.method === "GET" || !options.method) {
    url.searchParams.set("emp", companyId)
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  // Si es POST o PUT, el id de empresa va en el body
  let body = options.body
  if ((options.method === "POST" || options.method === "PUT") && body) {
    const bodyData = JSON.parse(body as string)
    bodyData.id_empresa = Number.parseInt(companyId)
    body = JSON.stringify(bodyData)
  }

  const response = await fetch(url.toString(), { ...options, headers, body })

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
      console.error(`Error en la llamada a Zureo (${endpoint}):`, errorData)
    } catch (e) {
      errorData = { error: response.statusText }
    }
    throw new Error(`Error de API Zureo: ${errorData.error?.message || response.statusText}`)
  }

  return response.json()
}

// --- Funciones para Productos ---
export async function getProductsFromZureo(
  params: { date?: string; from?: number; qty?: number } = {},
): Promise<ZureoProduct[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const result = await zureoFetch(`/sdk/v1/product/all?${query}`)
  return result.products
}

export async function getProductByCode(code: string): Promise<ZureoProduct | null> {
  const result = await zureoFetch(`/sdk/v1/product/get?codigo=${code}`)
  return result.product || null
}

// --- Funciones para Pedidos ---
export async function createOrderInZureo(orderData: Omit<ZureoOrder, "id_empresa">): Promise<any> {
  return zureoFetch("/sdk/v1/order/add", {
    method: "POST",
    body: JSON.stringify(orderData),
  })
}

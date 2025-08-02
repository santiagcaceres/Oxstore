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

  // Formato exacto según la guía: usuario:contraseña:dominio
  const credentials = `${user}:${pass}:${domain}`
  const encodedCredentials = Buffer.from(credentials).toString("base64")

  try {
    console.log("Solicitando token a Zureo...")
    console.log("Usuario:", user)
    console.log("Dominio:", domain)
    console.log("Credentials encoded:", encodedCredentials)

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
      console.error("Error al obtener token de Zureo:", response.status, errorText)
      throw new Error(`Error de autenticación: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Respuesta de autenticación:", data)

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

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  const response = await fetch(`https://api.zureo.com${endpoint}`, { ...options, headers })

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
      console.error(`Error en la llamada a Zureo (${endpoint}):`, errorData)
    } catch (e) {
      const errorText = await response.text()
      console.error(`Error en la llamada a Zureo (${endpoint}):`, errorText)
      errorData = { error: errorText }
    }
    throw new Error(`Error de API Zureo: ${errorData.error?.message || errorData.error || response.statusText}`)
  }

  return response.json()
}

// --- Funciones para Productos ---
export async function getProductsFromZureo(
  params: { emp?: number; qty?: number; from?: number; date?: string } = {},
): Promise<ZureoProduct[]> {
  const { emp = 1, qty = 100, ...otherParams } = params
  const query = new URLSearchParams({
    emp: emp.toString(),
    qty: qty.toString(),
    ...Object.fromEntries(Object.entries(otherParams).map(([k, v]) => [k, String(v)])),
  }).toString()

  const result = await zureoFetch(`/sdk/v1/product/all?${query}`)
  return result.data || result.products || result
}

export async function getProductById(id: string): Promise<ZureoProduct | null> {
  try {
    const result = await zureoFetch(`/sdk/v1/product/get?id=${id}`)
    return result.data || result.product || result
  } catch (error) {
    console.error(`Error obteniendo producto ${id}:`, error)
    return null
  }
}

export async function getProductImages(id: string, varId?: string): Promise<any> {
  const query = varId ? `id=${id}&var=${varId}` : `id=${id}`
  const result = await zureoFetch(`/sdk/v1/product/image?${query}`)
  return result.data || result
}

// --- Funciones para Empresas ---
export async function getCompaniesFromZureo(): Promise<any> {
  const result = await zureoFetch("/sdk/v1/company/all")
  return result.data || result
}

export async function getCompanyById(id: number): Promise<any> {
  const result = await zureoFetch(`/sdk/v1/company/get?id=${id}`)
  return result.data || result
}

// --- Funciones para Marcas ---
export async function getBrandsFromZureo(): Promise<any> {
  const result = await zureoFetch("/sdk/v1/brand/all")
  return result.data || result
}

// --- Funciones para Tipos de Producto ---
export async function getProductTypesFromZureo(emp = 1): Promise<any> {
  const result = await zureoFetch(`/sdk/v1/product_type/all?emp=${emp}`)
  return result.data || result
}

// --- Funciones para Precios ---
export async function getPricesFromZureo(emp = 1): Promise<any> {
  const result = await zureoFetch(`/sdk/v1/prices/all?emp=${emp}`)
  return result.data || result
}

// --- Funciones para Métodos de Pago ---
export async function getPaymentMethodsFromZureo(): Promise<any> {
  const result = await zureoFetch("/sdk/v1/payment/methods")
  return result.data || result
}

// --- Funciones para Envíos ---
export async function getShippingMethodsFromZureo(emp = 1): Promise<any> {
  const result = await zureoFetch(`/sdk/v1/shipping/get?emp=${emp}`)
  return result.data || result
}

export async function getLocalitiesFromZureo(): Promise<any> {
  const result = await zureoFetch("/sdk/v1/shipping/localities")
  return result.data || result
}

// --- Funciones para Pedidos ---
export async function createOrderInZureo(orderData: Omit<ZureoOrder, "id_empresa">): Promise<any> {
  return zureoFetch("/sdk/v1/order/add", {
    method: "POST",
    body: JSON.stringify({ ...orderData, id_empresa: 1 }),
  })
}

// --- Funciones para Stock ---
export async function getStockBySucursal(emp = 1, suc = 1, date?: string): Promise<any> {
  const query = date ? `emp=${emp}&suc=${suc}&date=${date}` : `emp=${emp}&suc=${suc}`
  const result = await zureoFetch(`/sdk/v1/product/stock-by-sucursal?${query}`)
  return result.data || result
}

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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
      body: "{}",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error al obtener token de Zureo:", response.status, errorText)
      throw new Error(`Error de autenticación: ${response.status} - ${errorText}`)
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
  params: { emp?: number; qty?: number; from?: number; date?: string; includeInactive?: boolean } = {},
): Promise<ZureoProduct[]> {
  const { emp = 1, qty = 100, includeInactive = false, ...otherParams } = params
  const query = new URLSearchParams({
    emp: emp.toString(),
    qty: qty.toString(),
    ...Object.fromEntries(Object.entries(otherParams).map(([k, v]) => [k, String(v)])),
  }).toString()

  const result = await zureoFetch(`/sdk/v1/product/all?${query}`)
  const products = result.data || result.products || result || []

  // Filtrar productos dados de baja si no se especifica incluirlos
  if (!includeInactive) {
    return products.filter((product: ZureoProduct) => !product.baja)
  }

  return products
}

export async function getProductById(id: string): Promise<ZureoProduct | null> {
  try {
    const result = await zureoFetch(`/sdk/v1/product/get?id=${id}`)
    const product = result.data || result.product || result

    // Verificar que el producto no esté dado de baja
    if (product && product.baja) {
      console.log(`Producto ${id} está dado de baja`)
      return null
    }

    return product
  } catch (error) {
    console.error(`Error obteniendo producto ${id}:`, error)
    return null
  }
}

export async function getProductByCode(code: string): Promise<ZureoProduct | null> {
  try {
    // Buscar en todos los productos por código
    const allProducts = await getProductsFromZureo({ qty: 1000, includeInactive: false })
    const product = allProducts.find((p) => p.codigo === code)

    if (!product) {
      console.log(`Producto con código ${code} no encontrado o está dado de baja`)
      return null
    }

    return product
  } catch (error) {
    console.error(`Error obteniendo producto por código ${code}:`, error)
    return null
  }
}

export async function getProductImages(id: string, varId?: string): Promise<any[]> {
  try {
    const query = varId ? `id=${id}&var=${varId}` : `id=${id}`
    const result = await zureoFetch(`/sdk/v1/product/image?${query}`)
    return result.data || result || []
  } catch (error) {
    console.error(`Error obteniendo imágenes del producto ${id}:`, error)
    return []
  }
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

// --- Función para subir imágenes ---
export async function uploadProductImage(productId: string, imageFile: File): Promise<any> {
  try {
    // Convertir imagen a base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remover el prefijo data:image/...;base64,
        const base64Data = result.split(",")[1]
        resolve(base64Data)
      }
      reader.readAsDataURL(imageFile)
    })

    const imageData = {
      id_producto: Number.parseInt(productId),
      base64: base64,
      descripcion: imageFile.name,
      filename: imageFile.name,
    }

    const result = await zureoFetch("/sdk/v1/product/image/add", {
      method: "POST",
      body: JSON.stringify(imageData),
    })

    return result
  } catch (error) {
    console.error(`Error subiendo imagen para producto ${productId}:`, error)
    throw error
  }
}

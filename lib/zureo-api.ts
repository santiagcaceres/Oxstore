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
  const companyId = process.env.ZUREO_COMPANY_ID

  if (!user || !pass || !companyId) {
    console.error("Faltan credenciales de Zureo en las variables de entorno.")
    throw new Error("Credenciales de Zureo no configuradas.")
  }

  const authUrl = "https://api.zureo.com/auth/token"
  console.log("[v0] Intentando autenticar con:", authUrl)

  try {
    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario: user,
        password: pass,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error al obtener token de Zureo:", response.status, errorText)
      throw new Error(`Error de autenticación: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Token obtenido exitosamente")

    tokenCache = {
      token: data.token,
      valid_to: Date.now() + (data.expires_in || 3600) * 1000, // Default 1 hora
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

  const fullUrl = `https://api.zureo.com${endpoint}`
  console.log("[v0] Llamando a:", fullUrl)

  const response = await fetch(fullUrl, { ...options, headers })

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
  const { emp = 1, qty = 1000, includeInactive = false, ...otherParams } = params
  const query = new URLSearchParams({
    empresa: emp.toString(),
    limit: qty.toString(),
    offset: (otherParams.from || 0).toString(),
    ...Object.fromEntries(
      Object.entries(otherParams)
        .filter(([k]) => k !== "from")
        .map(([k, v]) => [k, String(v)]),
    ),
  }).toString()

  try {
    const result = await zureoFetch(`/api/productos?${query}`)
    const products = result.data || result.productos || result || []

    console.log(`[v0] Obtenidos ${products.length} productos de Zureo`)

    if (includeInactive) {
      return products
    }
    return products.filter((product: ZureoProduct) => !product.baja)
  } catch (error) {
    console.error("Error fetching products from Zureo:", error)
    return []
  }
}

export async function getAllZureoProducts(): Promise<ZureoProduct[]> {
  return getProductsFromZureo({ qty: 5000, includeInactive: true })
}

export async function getProductById(id: string): Promise<ZureoProduct | null> {
  try {
    const result = await zureoFetch(`/api/productos/${id}`)
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

export async function getProductByCode(code: string, includeInactive = false): Promise<ZureoProduct | null> {
  try {
    const allProducts = await getProductsFromZureo({ qty: 5000, includeInactive })
    const product = allProducts.find((p) => p.codigo === code)
    return product || null
  } catch (error) {
    console.error(`Error getting product by code ${code}:`, error)
    return null
  }
}

export async function searchZureoProducts(query: string): Promise<ZureoProduct[]> {
  try {
    const products = await getProductsFromZureo()

    if (!query.trim()) {
      return products
    }

    const searchTerm = query.toLowerCase().trim()

    return products.filter((product) => {
      const searchableText = [product.descripcion, product.codigo, product.marca, product.rubro, product.subrubro]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchableText.includes(searchTerm)
    })
  } catch (error) {
    console.error("Error searching Zureo products:", error)
    return []
  }
}

export async function getProductImages(id: string, varId?: string): Promise<any[]> {
  try {
    const query = varId ? `id=${id}&var=${varId}` : `id=${id}`
    const result = await zureoFetch(`/api/productos/${id}/imagenes?${query}`)
    return result.data || result || []
  } catch (error) {
    console.error(`Error obteniendo imágenes del producto ${id}:`, error)
    return []
  }
}

export async function getZureoProducts(
  params: { emp?: number; qty?: number; from?: number; date?: string; includeInactive?: boolean } = {},
): Promise<{ success: boolean; data: ZureoProduct[] }> {
  try {
    const products = await getProductsFromZureo(params)
    return {
      success: true,
      data: products,
    }
  } catch (error) {
    console.error("Error in getZureoProducts:", error)
    return {
      success: false,
      data: [],
    }
  }
}

// --- Funciones para Empresas ---
export async function getCompaniesFromZureo(): Promise<any> {
  const result = await zureoFetch("/api/empresas")
  return result.data || result
}

export async function getCompanyById(id: number): Promise<any> {
  const result = await zureoFetch(`/api/empresas/${id}`)
  return result.data || result
}

// --- Funciones para Marcas ---
export async function getBrandsFromZureo(): Promise<any> {
  const result = await zureoFetch("/api/marcas")
  return result.data || result
}

// --- Funciones para Tipos de Producto ---
export async function getProductTypesFromZureo(emp = 1): Promise<any> {
  const result = await zureoFetch(`/api/tipos-productos?emp=${emp}`)
  return result.data || result
}

// --- Funciones para Precios ---
export async function getPricesFromZureo(emp = 1): Promise<any> {
  const result = await zureoFetch(`/api/precios?emp=${emp}`)
  return result.data || result
}

// --- Funciones para Métodos de Pago ---
export async function getPaymentMethodsFromZureo(): Promise<any> {
  const result = await zureoFetch("/api/metodos-pago")
  return result.data || result
}

// --- Funciones para Envíos ---
export async function getShippingMethodsFromZureo(emp = 1): Promise<any> {
  const result = await zureoFetch(`/api/envios?emp=${emp}`)
  return result.data || result
}

export async function getLocalitiesFromZureo(): Promise<any> {
  const result = await zureoFetch("/api/localidades")
  return result.data || result
}

// --- Funciones para Pedidos ---
export async function createOrderInZureo(orderData: Omit<ZureoOrder, "id_empresa">): Promise<any> {
  return zureoFetch("/api/pedidos", {
    method: "POST",
    body: JSON.stringify({ ...orderData, id_empresa: 1 }),
  })
}

// --- Funciones para Stock ---
export async function getStockBySucursal(emp = 1, suc = 1, date?: string): Promise<any> {
  const query = date ? `empresa=${emp}&sucursal=${suc}&fecha=${date}` : `empresa=${emp}&sucursal=${suc}`
  const result = await zureoFetch(`/api/stock?${query}`)
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

    const result = await zureoFetch("/api/productos/imagenes", {
      method: "POST",
      body: JSON.stringify(imageData),
    })

    return result
  } catch (error) {
    console.error(`Error subiendo imagen para producto ${productId}:`, error)
    throw error
  }
}

export { getZureoToken }

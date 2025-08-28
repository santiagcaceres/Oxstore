interface ZureoAuthResponse {
  token: string
  auth_type: string
  status: string
  valid_to: string
}

interface ZureoProduct {
  id: number
  codigo: string
  nombre: string
  fecha_alta: string
  fecha_modificado: string
  stock: number
  descripcion_corta: string
  descripcion_larga: string
  precio: number
  id_moneda: number
  impuesto: number
  tipo: {
    id: number
    nombre: string
  }
  marca: {
    id: number
    nombre: string
  }
  variedades: Array<{
    id: number
    nombre: string
    descripcion: string
    stock: number
    precio: number
    atributos: Array<{
      atributo: string
      valor: string
    }>
  }>
}

interface ZureoBrand {
  id: number
  nombre: string
  fecha_modificado: string
}

interface ZureoProductType {
  id: number
  nombre: string
  fecha_modificado: string
  hijos: ZureoProductType[]
}

class ZureoAPI {
  private baseUrl: string
  private username: string
  private password: string
  private domain: string
  private companyId: string
  private token: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    this.baseUrl = process.env.ZUREO_API_URL || "https://api.zureo.com"
    this.username = process.env.ZUREO_USERNAME || ""
    this.password = process.env.ZUREO_PASSWORD || ""
    this.domain = process.env.ZUREO_DOMAIN || ""
    this.companyId = process.env.ZUREO_COMPANY_ID || "1"

    console.log("[v0] ZureoAPI initialized with:")
    console.log("- Base URL:", this.baseUrl)
    console.log("- Username:", this.username ? "✓ Set" : "✗ Missing")
    console.log("- Password:", this.password ? "✓ Set" : "✗ Missing")
    console.log("- Domain:", this.domain || "✗ Missing")
    console.log("- Company ID:", this.companyId)
  }

  private async authenticate(): Promise<string> {
    // Check if token is still valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token
    }

    const credentials = `${this.username}:${this.password}:${this.domain}`
    const encodedCredentials = Buffer.from(credentials).toString("base64")

    try {
      console.log("[v0] Authenticating with Zureo API...")
      console.log("- Auth URL:", `${this.baseUrl}/sdk/v1/security/login`)
      console.log("- Credentials format:", `${this.username}:***:${this.domain}`)

      const response = await fetch(`${this.baseUrl}/sdk/v1/security/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedCredentials}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Authentication failed:")
        console.error("- Status:", response.status, response.statusText)
        console.error("- Response:", errorText)
        throw new Error(`Authentication failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: ZureoAuthResponse = await response.json()
      this.token = data.token
      this.tokenExpiry = new Date(data.valid_to)

      console.log("[v0] Authentication successful!")
      console.log("- Token expires:", this.tokenExpiry.toISOString())

      return this.token
    } catch (error) {
      console.error("[v0] Zureo authentication error:", error)
      throw error
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.authenticate()

    const fullUrl = `${this.baseUrl}${endpoint}`
    console.log("[v0] Making request to:", fullUrl)

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      })

      if (response.status === 429) {
        const errorData = await response.json()
        const errorMsg = `Rate limit exceeded. Try again after: ${errorData.until}`
        console.error("[v0]", errorMsg)
        throw new Error(errorMsg)
      }

      if (!response.ok) {
        const errorText = await response.text()
        const errorMsg = `API request failed: ${response.status} ${response.statusText} - ${errorText}`
        console.error("[v0]", errorMsg)
        throw new Error(errorMsg)
      }

      const data = await response.json()
      console.log("[v0] Request successful, received data keys:", Object.keys(data))
      return data
    } catch (error) {
      console.error("[v0] Request error for", fullUrl, ":", error)
      throw error
    }
  }

  async getAllProducts(): Promise<ZureoProduct[]> {
    const allProducts: ZureoProduct[] = []
    let offset = 0
    const limit = 1000

    console.log("[v0] Starting to fetch all products...")
    console.log("- Company ID:", this.companyId)
    console.log("- Limit per request:", limit)

    while (true) {
      try {
        console.log(`[v0] Fetching products batch: offset=${offset}, limit=${limit}`)

        const response = await this.makeRequest<{
          data: ZureoProduct[]
          from: number
          qty: number
        }>(`/sdk/v1/product/all?emp=${this.companyId}&from=${offset}&qty=${limit}`)

        console.log(`[v0] Received ${response.data?.length || 0} products in this batch`)

        if (!response.data || response.data.length === 0) {
          console.log("[v0] No more products to fetch")
          break
        }

        allProducts.push(...response.data)

        // If we got less than the limit, we've reached the end
        if (response.qty < limit) {
          console.log("[v0] Reached end of products (received less than limit)")
          break
        }

        offset += limit

        // Add delay to respect rate limiting (12 calls every 30 seconds)
        console.log("[v0] Waiting 2.5s before next request (rate limiting)...")
        await new Promise((resolve) => setTimeout(resolve, 2500))
      } catch (error) {
        console.error(`[v0] Error fetching products at offset ${offset}:`, error)
        throw error
      }
    }

    console.log(`[v0] Total products fetched: ${allProducts.length}`)
    return allProducts
  }

  async getNewProducts(days = 15): Promise<ZureoProduct[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const dateString = cutoffDate.toISOString().split("T")[0]

    const allProducts: ZureoProduct[] = []
    let offset = 0
    const limit = 1000

    while (true) {
      try {
        const response = await this.makeRequest<{
          data: ZureoProduct[]
          from: number
          qty: number
        }>(`/sdk/v1/product/all?emp=${this.companyId}&date=${dateString}&from=${offset}&qty=${limit}`)

        allProducts.push(...response.data)

        if (response.qty < limit) {
          break
        }

        offset += limit
        await new Promise((resolve) => setTimeout(resolve, 2500))
      } catch (error) {
        console.error(`Error fetching new products at offset ${offset}:`, error)
        throw error
      }
    }

    return allProducts
  }

  async getProduct(id: number): Promise<ZureoProduct> {
    return this.makeRequest<{ data: ZureoProduct }>(`/sdk/v1/product/get?id=${id}`).then((response) => response.data)
  }

  async getBrands(): Promise<ZureoBrand[]> {
    console.log("[v0] Fetching brands from Zureo...")
    try {
      const response = await this.makeRequest<{ data: ZureoBrand[] }>("/sdk/v1/brand/all")
      console.log(`[v0] Fetched ${response.data?.length || 0} brands`)
      return response.data || []
    } catch (error) {
      console.error("[v0] Error fetching brands:", error)
      throw error
    }
  }

  async getProductTypes(): Promise<ZureoProductType[]> {
    return this.makeRequest<{ data: ZureoProductType[] }>(`/sdk/v1/product_type/all?emp=${this.companyId}`).then(
      (response) => response.data,
    )
  }

  async getProductImages(
    productId: number,
    varietyId?: number,
  ): Promise<
    Array<{
      id: number
      tipo_nombre: string
      base64: string
      descripcion: string
      filename: string
    }>
  > {
    const endpoint = varietyId
      ? `/sdk/v1/product/image?id=${productId}&var=${varietyId}`
      : `/sdk/v1/product/image?id=${productId}`

    return this.makeRequest<{
      data: Array<{
        id: number
        tipo_nombre: string
        base64: string
        descripcion: string
        filename: string
      }>
    }>(endpoint).then((response) => response.data)
  }
}

export const zureoAPI = new ZureoAPI()
export type { ZureoProduct, ZureoBrand, ZureoProductType }

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
    this.baseUrl = process.env.ZUREO_API_URL || "https://020128150011"
    this.username = process.env.ZUREO_USERNAME || ""
    this.password = process.env.ZUREO_PASSWORD || ""
    this.domain = process.env.ZUREO_DOMAIN || ""
    this.companyId = process.env.ZUREO_COMPANY_ID || "1"
  }

  private async authenticate(): Promise<string> {
    // Check if token is still valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token
    }

    const credentials = `${this.username}:${this.password}:${this.domain}`
    const encodedCredentials = Buffer.from(credentials).toString("base64")

    try {
      const response = await fetch(`${this.baseUrl}/sdk/v1/security/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedCredentials}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`)
      }

      const data: ZureoAuthResponse = await response.json()
      this.token = data.token
      this.tokenExpiry = new Date(data.valid_to)

      return this.token
    } catch (error) {
      console.error("Zureo authentication error:", error)
      throw error
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.authenticate()

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (response.status === 429) {
      const errorData = await response.json()
      throw new Error(`Rate limit exceeded. Try again after: ${errorData.until}`)
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    return response.json()
  }

  async getAllProducts(): Promise<ZureoProduct[]> {
    const allProducts: ZureoProduct[] = []
    let offset = 0
    const limit = 1000

    while (true) {
      try {
        const response = await this.makeRequest<{
          data: ZureoProduct[]
          from: number
          qty: number
        }>(`/sdk/v1/product/all?emp=${this.companyId}&from=${offset}&qty=${limit}`)

        allProducts.push(...response.data)

        // If we got less than the limit, we've reached the end
        if (response.qty < limit) {
          break
        }

        offset += limit

        // Add delay to respect rate limiting (12 calls every 30 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2500))
      } catch (error) {
        console.error(`Error fetching products at offset ${offset}:`, error)
        throw error
      }
    }

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
    return this.makeRequest<{ data: ZureoBrand[] }>("/sdk/v1/brand/all").then((response) => response.data)
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

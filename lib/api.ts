export interface ZureoProduct {
  id: number
  codigo: string
  descripcion: string
  precio: number
  stock: number
  marca: string
  rubro: string
  imagen?: string
}

export interface ZureoMarca {
  id: number
  nombre: string
}

export interface ZureoRubro {
  id: number
  nombre: string
}

export interface ZureoAuthResponse {
  token: string
  expires_in: number
  valid_to: string
}

export interface ApiProduct {
  id: string
  name: string
  price: number
  stock: number
  sku: string
  category: string
  images: string[]
}

export interface StockUpdate {
  sku: string
  quantity: number
}

export class ZureoAPI {
  private baseUrl: string
  private token: string | null = null
  private tokenExpiry = 0
  private readonly credentials = {
    usuario: process.env.ZUREO_USERNAME || "patricia_saura@hotmail.com",
    password: process.env.ZUREO_PASSWORD || "ps1106",
    dominio: process.env.ZUREO_DOMAIN || "020128150011",
    companyId: Number.parseInt(process.env.ZUREO_COMPANY_ID || "1"),
  }

  constructor() {
    this.baseUrl = process.env.ZUREO_API_URL || "https://api.zureo.com"
    console.log("✅ Using Zureo API URL:", this.baseUrl)
  }

  async authenticate(): Promise<boolean> {
    try {
      const authUrl = `${this.baseUrl}/sdk/v1/security/login`

      const credentials = `${this.credentials.usuario}:${this.credentials.password}:${this.credentials.dominio}`
      const encodedCredentials = Buffer.from(credentials).toString("base64")

      console.log("🔐 Attempting authentication with Zureo...")
      console.log("Auth URL:", authUrl)

      const response = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedCredentials}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Authentication failed:", response.status, response.statusText)
        console.error("Response:", errorText)
        return false
      }

      const data = await response.json()
      this.token = data.token
      this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000

      console.log("✅ Successfully authenticated with Zureo API")
      return true
    } catch (error) {
      console.error("❌ Error authenticating with Zureo:", error)
      return false
    }
  }

  private async ensureAuthenticated(): Promise<boolean> {
    if (!this.token || Date.now() >= this.tokenExpiry) {
      return await this.authenticate()
    }
    return true
  }

  private async makeAuthenticatedRequest(url: string): Promise<any> {
    if (!(await this.ensureAuthenticated())) {
      throw new Error("Failed to authenticate")
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`)
    }

    return await response.json()
  }

  async getAllProducts(): Promise<ZureoProduct[]> {
    try {
      const allProducts: ZureoProduct[] = []
      let offset = 0
      const limit = 1000

      while (true) {
        const url = `${this.baseUrl}/sdk/v1/product/all?emp=${this.credentials.companyId}&from=${offset}&qty=${limit}`
        const response = await this.makeAuthenticatedRequest(url)

        if (!response?.data || response.data.length === 0) {
          break
        }

        allProducts.push(...response.data)

        if (response.data.length < limit) {
          break
        }

        offset += limit
      }

      console.log(`📦 Fetched ${allProducts.length} products from Zureo`)
      return allProducts
    } catch (error) {
      console.error("Error fetching all products:", error)
      return []
    }
  }

  async getMarcas(): Promise<ZureoMarca[]> {
    try {
      const url = `${this.baseUrl}/sdk/v1/brand/all`
      const response = await this.makeAuthenticatedRequest(url)
      return response?.data || []
    } catch (error) {
      console.error("Error fetching marcas:", error)
      return []
    }
  }

  async getBrands(): Promise<ZureoMarca[]> {
    return this.getMarcas()
  }

  async getRubros(): Promise<ZureoRubro[]> {
    try {
      const url = `${this.baseUrl}/sdk/v1/product_type/all?emp=${this.credentials.companyId}`
      const response = await this.makeAuthenticatedRequest(url)
      return response?.data || []
    } catch (error) {
      console.error("Error fetching rubros:", error)
      return []
    }
  }

  async getCategories(): Promise<ZureoRubro[]> {
    return this.getRubros()
  }

  // Método para convertir productos de Zureo al formato interno
  convertToApiProduct(zureoProduct: any): ApiProduct {
    return {
      id: zureoProduct.id.toString(),
      name: zureoProduct.nombre || "Producto sin nombre",
      price: zureoProduct.precio || 0,
      stock: zureoProduct.stock || 0,
      sku: zureoProduct.codigo || "",
      category: zureoProduct.tipo?.nombre || "Sin categoría",
      images: ["/generic-product-display.png"],
    }
  }

  async getProducts(): Promise<ApiProduct[]> {
    try {
      const zureoProducts = await this.getAllProducts()
      return zureoProducts.map((product) => this.convertToApiProduct(product))
    } catch (error) {
      console.error("Error converting products:", error)
      return []
    }
  }

  async getStock(sku: string): Promise<number> {
    try {
      const products = await this.getAllProducts()
      const product = products.find((p) => p.codigo === sku)
      return product?.stock || 0
    } catch (error) {
      console.error("Error fetching stock:", error)
      return 0
    }
  }

  // Método para sincronizar productos con la base de datos local
  async syncProducts(): Promise<boolean> {
    try {
      const products = await this.getAllProducts()
      console.log(`Sincronizados ${products.length} productos desde Zureo`)
      return true
    } catch (error) {
      console.error("Error syncing products:", error)
      return false
    }
  }
}

// Mantener compatibilidad con la clase anterior
export class OxstoreAPI extends ZureoAPI {
  constructor() {
    super()
  }
}

export const oxstoreAPI = new OxstoreAPI()
export const zureoAPI = new ZureoAPI()

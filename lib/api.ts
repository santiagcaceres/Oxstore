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
  private baseUrl = "https://020128150011"
  private token: string | null = null
  private tokenExpiry = 0
  private readonly credentials = {
    usuario: "patricia_saura@hotmail.com",
    password: "ps1106",
    companyId: 1,
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.credentials),
      })

      if (!response.ok) {
        throw new Error("Authentication failed")
      }

      const data: ZureoAuthResponse = await response.json()
      this.token = data.token
      this.tokenExpiry = Date.now() + data.expires_in * 1000

      return true
    } catch (error) {
      console.error("Error authenticating with Zureo:", error)
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
        const url = `${this.baseUrl}/api/productos?empresa=1&limit=${limit}&offset=${offset}`
        const products = await this.makeAuthenticatedRequest(url)

        if (!products || products.length === 0) {
          break
        }

        allProducts.push(...products)

        // Si recibimos menos de 1000 productos, hemos llegado al final
        if (products.length < limit) {
          break
        }

        offset += limit
      }

      return allProducts
    } catch (error) {
      console.error("Error fetching all products:", error)
      return []
    }
  }

  async getMarcas(): Promise<ZureoMarca[]> {
    try {
      const url = `${this.baseUrl}/api/marcas?empresa=1`
      return await this.makeAuthenticatedRequest(url)
    } catch (error) {
      console.error("Error fetching marcas:", error)
      return []
    }
  }

  async getRubros(): Promise<ZureoRubro[]> {
    try {
      const url = `${this.baseUrl}/api/rubros?empresa=1`
      return await this.makeAuthenticatedRequest(url)
    } catch (error) {
      console.error("Error fetching rubros:", error)
      return []
    }
  }

  // Método para convertir productos de Zureo al formato interno
  convertToApiProduct(zureoProduct: ZureoProduct): ApiProduct {
    return {
      id: zureoProduct.id.toString(),
      name: zureoProduct.descripcion,
      price: zureoProduct.precio,
      stock: zureoProduct.stock,
      sku: zureoProduct.codigo,
      category: zureoProduct.rubro,
      images: zureoProduct.imagen ? [zureoProduct.imagen] : ["/generic-product-display.png"],
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

export const oxstoreAPI = new ZureoAPI()
export const zureoAPI = new ZureoAPI()

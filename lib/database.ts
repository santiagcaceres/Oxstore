// Database connection and query utilities
import { zureoAPI, type ZureoProduct } from "./api"

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  compare_price?: number
  sku: string
  stock_quantity: number
  category_id: number
  brand: string
  weight?: number
  dimensions?: string
  is_active: boolean
  is_featured: boolean
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
  category?: Category
  images?: ProductImage[]
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  alt_text?: string
  sort_order: number
  is_primary: boolean
  created_at: string
}

export interface Banner {
  id: number
  title: string
  subtitle?: string
  image_url: string
  mobile_image_url?: string
  link_url?: string
  button_text?: string
  position: string
  is_active: boolean
  sort_order: number
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export class Database {
  static async getProducts(filters?: {
    category?: string
    featured?: boolean
    search?: string
    limit?: number
    offset?: number
  }): Promise<{ products: Product[]; total: number }> {
    try {
      console.log("[v0] Fetching products from Zureo API...")
      const zureoProducts = await zureoAPI.getAllProducts()
      console.log("[v0] Zureo products fetched:", zureoProducts.length)

      // Convertir productos de Zureo al formato interno
      let products: Product[] = zureoProducts.map((zp: ZureoProduct, index: number) => ({
        id: zp.id,
        name: zp.descripcion,
        slug: zp.descripcion
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim(),
        description: zp.descripcion,
        short_description: zp.descripcion.substring(0, 100),
        price: zp.precio,
        compare_price: zp.precio * 1.2, // Precio comparativo 20% mayor
        sku: zp.codigo,
        stock_quantity: zp.stock,
        category_id: 1, // Por defecto, se puede mapear según el rubro
        brand: zp.marca || "Oxstore",
        is_active: zp.stock > 0,
        is_featured: index < 6, // Los primeros 6 productos como destacados
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [
          {
            id: zp.id,
            product_id: zp.id,
            image_url: zp.imagen || "/generic-product-display.png",
            alt_text: zp.descripcion,
            sort_order: 0,
            is_primary: true,
            created_at: new Date().toISOString(),
          },
        ],
      }))

      console.log("[v0] Products converted:", products.length)

      // Aplicar filtros
      if (filters?.category) {
        const categoryMap: { [key: string]: string } = {
          mujer: "mujer",
          hombre: "hombre",
        }
        const categoryFilter = categoryMap[filters.category]
        if (categoryFilter) {
          products = products.filter(
            (p) => p.name.toLowerCase().includes(categoryFilter) || p.brand.toLowerCase().includes(categoryFilter),
          )
        }
      }

      if (filters?.featured) {
        products = products.filter((p) => p.is_featured)
        console.log("[v0] Featured products filtered:", products.length)
      }

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase()
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.brand.toLowerCase().includes(searchTerm) ||
            p.sku.toLowerCase().includes(searchTerm),
        )
      }

      const total = products.length
      const offset = filters?.offset || 0
      const limit = filters?.limit || 20

      console.log("[v0] Final products count:", products.slice(offset, offset + limit).length)

      return {
        products: products.slice(offset, offset + limit),
        total,
      }
    } catch (error) {
      console.error("[v0] Error fetching products from Zureo:", error)
      return {
        products: [],
        total: 0,
      }
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    const { products } = await this.getProducts()
    return products.find((p) => p.slug === slug) || null
  }

  static async getCategories(): Promise<Category[]> {
    try {
      console.log("[v0] Fetching categories from Zureo API...")
      const rubros = await zureoAPI.getRubros()
      console.log("[v0] Zureo categories fetched:", rubros.length)

      const allowedCategories = ["mujer", "hombre", "vestimenta", "calzado", "accesorios"]

      return rubros
        .filter((rubro) => allowedCategories.some((cat) => rubro.nombre.toLowerCase().includes(cat)))
        .map((rubro, index) => ({
          id: rubro.id,
          name: rubro.nombre,
          slug: rubro.nombre
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim(),
          description: `Productos de ${rubro.nombre}`,
          image_url: `/categoria-${rubro.nombre.toLowerCase()}.png`,
          is_active: true,
          sort_order: index + 1,
          created_at: new Date().toISOString(),
        }))
    } catch (error) {
      console.error("[v0] Error fetching categories from Zureo:", error)
      return [
        {
          id: 1,
          name: "Mujer",
          slug: "mujer",
          description: "Ropa y accesorios para mujer",
          image_url: "/categoria-mujer.png",
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Hombre",
          slug: "hombre",
          description: "Ropa y accesorios para hombre",
          image_url: "/categoria-hombre.png",
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
        },
      ]
    }
  }

  static async getBanners(position?: string): Promise<Banner[]> {
    console.log("[v0] Getting banners from database, no mock data")
    return []
  }
}

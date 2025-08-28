// Database connection and query utilities
import { zureoAPI } from "./zureo-api"

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
  // Los productos ahora se obtienen directamente desde /api/zureo/products

  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const zureoProducts = await zureoAPI.getAllProducts()
      const product = zureoProducts.find(
        (p) =>
          p.nombre
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim() === slug,
      )

      if (!product) return null

      return {
        id: product.id,
        name: product.nombre,
        slug: product.nombre
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim(),
        description: product.descripcion_larga || product.descripcion_corta,
        short_description: product.descripcion_corta,
        price: product.precio,
        compare_price: product.precio * 1.2,
        sku: product.codigo,
        stock_quantity: product.stock,
        category_id: 1,
        brand: product.marca.nombre,
        is_active: product.stock > 0,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error("[v0] Error fetching product by slug:", error)
      return null
    }
  }

  static async getCategories(): Promise<Category[]> {
    try {
      console.log("[v0] Fetching categories from Zureo API...")
      const productTypes = await zureoAPI.getProductTypes()
      console.log("[v0] Zureo categories fetched:", productTypes.length)

      const allowedCategories = ["mujer", "hombre", "vestimenta", "calzado", "accesorios"]

      return productTypes
        .filter((type) => allowedCategories.some((cat) => type.nombre.toLowerCase().includes(cat)))
        .map((type, index) => ({
          id: type.id,
          name: type.nombre,
          slug: type.nombre
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim(),
          description: `Productos de ${type.nombre}`,
          image_url: `/categoria-${type.nombre.toLowerCase()}.png`,
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

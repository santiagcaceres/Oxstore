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

// Mock database functions - In production, replace with actual database queries
export class Database {
  static async getProducts(filters?: {
    category?: string
    featured?: boolean
    search?: string
    limit?: number
    offset?: number
  }): Promise<{ products: Product[]; total: number }> {
    try {
      const zureoProducts = await zureoAPI.getAllProducts()
      const marcas = await zureoAPI.getMarcas()
      const rubros = await zureoAPI.getRubros()

      // Crear mapas para conversión rápida
      const marcaMap = new Map(marcas.map((m) => [m.id, m.nombre]))
      const rubroMap = new Map(rubros.map((r) => [r.id, r.nombre]))

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

      // Aplicar filtros
      if (filters?.category) {
        const categoryMap: { [key: string]: string } = {
          mujer: "mujer",
          hombre: "hombre",
          nina: "niña",
          nino: "niño",
          bebes: "bebé",
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

      return {
        products: products.slice(offset, offset + limit),
        total,
      }
    } catch (error) {
      console.error("Error fetching products from Zureo:", error)
      // Fallback a datos mock en caso de error
      return this.getMockProducts(filters)
    }
  }

  private static async getMockProducts(filters?: {
    category?: string
    featured?: boolean
    search?: string
    limit?: number
    offset?: number
  }): Promise<{ products: Product[]; total: number }> {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "Camiseta Básica Mujer",
        slug: "camiseta-basica-mujer",
        description: "Camiseta de algodón 100% para mujer, perfecta para el día a día",
        short_description: "Camiseta básica de algodón",
        price: 29.99,
        compare_price: 39.99,
        sku: "CAM-MUJ-001",
        stock_quantity: 50,
        category_id: 1,
        brand: "Oxstore",
        is_active: true,
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [
          {
            id: 1,
            product_id: 1,
            image_url: "/camiseta-b-sica-mujer-blanca.png",
            alt_text: "Camiseta básica mujer blanca",
            sort_order: 0,
            is_primary: true,
            created_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: 2,
        name: "Jeans Slim Fit Hombre",
        slug: "jeans-slim-fit-hombre",
        description: "Jeans de corte slim fit para hombre, cómodos y modernos",
        short_description: "Jeans slim fit de alta calidad",
        price: 79.99,
        compare_price: 99.99,
        sku: "JEA-HOM-001",
        stock_quantity: 30,
        category_id: 2,
        brand: "Oxstore",
        is_active: true,
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [
          {
            id: 2,
            product_id: 2,
            image_url: "/jeans-slim-fit-hombre-azul.png",
            alt_text: "Jeans slim fit hombre azul",
            sort_order: 0,
            is_primary: true,
            created_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: 3,
        name: "Vestido Floral Niña",
        slug: "vestido-floral-nina",
        description: "Hermoso vestido con estampado floral para niñas",
        short_description: "Vestido floral cómodo y elegante",
        price: 45.99,
        compare_price: 55.99,
        sku: "VES-NIN-001",
        stock_quantity: 25,
        category_id: 3,
        brand: "Oxstore",
        is_active: true,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [
          {
            id: 3,
            product_id: 3,
            image_url: "/vestido-floral-ni-a-rosa.png",
            alt_text: "Vestido floral niña rosa",
            sort_order: 0,
            is_primary: true,
            created_at: new Date().toISOString(),
          },
        ],
      },
    ]

    let filteredProducts = mockProducts

    if (filters?.category) {
      const categoryMap: { [key: string]: number } = {
        mujer: 1,
        hombre: 2,
        nina: 3,
        nino: 4,
        bebes: 5,
      }
      const categoryId = categoryMap[filters.category]
      if (categoryId) {
        filteredProducts = filteredProducts.filter((p) => p.category_id === categoryId)
      }
    }

    if (filters?.featured) {
      filteredProducts = filteredProducts.filter((p) => p.is_featured)
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.brand.toLowerCase().includes(searchTerm),
      )
    }

    const total = filteredProducts.length
    const offset = filters?.offset || 0
    const limit = filters?.limit || 20

    return {
      products: filteredProducts.slice(offset, offset + limit),
      total,
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    const { products } = await this.getProducts()
    return products.find((p) => p.slug === slug) || null
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const rubros = await zureoAPI.getRubros()

      return rubros.map((rubro, index) => ({
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
      console.error("Error fetching categories from Zureo:", error)
      // Fallback a categorías mock
      return [
        {
          id: 1,
          name: "Mujer",
          slug: "mujer",
          description: "Ropa y accesorios para mujer",
          image_url: "/ropa-mujer.png",
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Hombre",
          slug: "hombre",
          description: "Ropa y accesorios para hombre",
          image_url: "/ropa-hombre.png",
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Niña",
          slug: "nina",
          description: "Ropa para niñas",
          image_url: "/ropa-ni-a.png",
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
        },
        {
          id: 4,
          name: "Niño",
          slug: "nino",
          description: "Ropa para niños",
          image_url: "/ropa-ni-o.png",
          is_active: true,
          sort_order: 4,
          created_at: new Date().toISOString(),
        },
        {
          id: 5,
          name: "Bebés",
          slug: "bebes",
          description: "Ropa para bebés",
          image_url: "/ropa-beb-.png",
          is_active: true,
          sort_order: 5,
          created_at: new Date().toISOString(),
        },
      ]
    }
  }

  static async getBanners(position?: string): Promise<Banner[]> {
    const mockBanners: Banner[] = [
      {
        id: 1,
        title: "Nueva Colección Primavera",
        subtitle: "Descubre las últimas tendencias en moda",
        image_url: "/banner-moda-primavera.png",
        link_url: "/categoria/mujer",
        button_text: "Ver Colección",
        position: "hero",
        is_active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Ofertas Especiales",
        subtitle: "3x2 en toda la tienda - Por tiempo limitado",
        image_url: "/banner-ofertas-especiales.png",
        link_url: "/ofertas",
        button_text: "Ver Ofertas",
        position: "secondary",
        is_active: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    if (position) {
      return mockBanners.filter((b) => b.position === position && b.is_active)
    }

    return mockBanners.filter((b) => b.is_active)
  }
}

export interface Brand {
  id: number
  descripcion: string
}

export interface Category {
  name: string
  href: string
}

export interface Product {
  id: string
  title: string
  price: number
  images: string[]
  handle: string
  brand: string
  description?: string
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  title: string
  price: number
  available: boolean
  sku?: string
}

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
  variant?: string
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: Date
  customerInfo: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    department: string
  }
}

export interface Banner {
  id: string
  title: string
  description?: string
  imageUrl: string
  linkUrl?: string
  position: "hero" | "secondary" | "footer"
  active: boolean
  createdAt: Date
}

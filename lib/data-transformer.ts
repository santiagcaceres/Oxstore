import type { ZureoProduct } from "@/types/zureo"

export interface Product {
  id: string
  title: string
  handle: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  tags: string[]
  vendor: string
  productType: string
  variants: ProductVariant[]
  available: boolean
  stock: number
}

export interface ProductVariant {
  id: string
  title: string
  price: number
  available: boolean
  inventory_quantity: number
  option1?: string
  option2?: string
  option3?: string
}

export function transformZureoProduct(zureoProduct: ZureoProduct): Product {
  if (!zureoProduct) {
    throw new Error("Producto Zureo no válido")
  }

  // Generar handle a partir del nombre
  const handle =
    zureoProduct.nombre
      ?.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim() || `producto-${zureoProduct.id}`

  // Transformar variedades a variants
  const variants: ProductVariant[] =
    zureoProduct.variedades?.map((variedad, index) => ({
      id: `${zureoProduct.id}-${variedad.id || index}`,
      title: variedad.nombre || "Variante por defecto",
      price: variedad.precio || zureoProduct.precio || 0,
      available: (variedad.stock || 0) > 0,
      inventory_quantity: variedad.stock || 0,
      option1: variedad.atributos?.find((attr) => attr.atributo === "Color")?.valor,
      option2: variedad.atributos?.find((attr) => attr.atributo === "Talle")?.valor,
      option3: variedad.atributos?.find((attr) => attr.atributo === "Tamaño")?.valor,
    })) || []

  // Si no hay variedades, crear una variante por defecto
  if (variants.length === 0) {
    variants.push({
      id: `${zureoProduct.id}-default`,
      title: "Por defecto",
      price: zureoProduct.precio || 0,
      available: (zureoProduct.stock || 0) > 0,
      inventory_quantity: zureoProduct.stock || 0,
    })
  }

  // Calcular stock total
  const totalStock = variants.reduce((sum, variant) => sum + (variant.inventory_quantity || 0), 0)

  return {
    id: zureoProduct.id?.toString() || "0",
    title: zureoProduct.nombre || "Producto sin nombre",
    handle,
    description: zureoProduct.descripcion_larga || zureoProduct.descripcion_corta || "",
    price: zureoProduct.precio || 0,
    compareAtPrice: undefined,
    images: ["/placeholder.svg?height=400&width=400&text=" + encodeURIComponent(zureoProduct.nombre || "Producto")],
    tags: [zureoProduct.tipo?.nombre, zureoProduct.marca?.nombre].filter(Boolean),
    vendor: zureoProduct.marca?.nombre || "Sin marca",
    productType: zureoProduct.tipo?.nombre || "Sin categoría",
    variants,
    available: !zureoProduct.baja && totalStock > 0,
    stock: totalStock,
  }
}

export function transformZureoProducts(zureoProducts: ZureoProduct[]): Product[] {
  if (!Array.isArray(zureoProducts)) {
    return []
  }

  return zureoProducts
    .filter((product) => product && !product.baja) // Solo productos activos
    .map((product) => {
      try {
        return transformZureoProduct(product)
      } catch (error) {
        console.error(`Error transformando producto ${product?.id}:`, error)
        return null
      }
    })
    .filter((product): product is Product => product !== null)
}

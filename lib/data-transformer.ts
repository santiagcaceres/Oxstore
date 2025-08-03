import type { ZureoProduct, ZureoVariety } from "@/types/zureo"

// Define el tipo de producto unificado que usarán los componentes
export interface TransformedProduct {
  id: string
  handle: string
  title: string
  description: string
  price: number
  compareAtPrice: number | null
  inStock: boolean
  stock: number
  brand: string
  category: string
  images: string[]
  sizes: string[]
  colors: { name: string; value: string }[]
  rating: number
  reviewCount: number
  isActive: boolean // Nuevo campo para productos dados de baja
}

// Transforma un producto de Zureo al formato unificado
export function transformZureoProduct(product: ZureoProduct, images: any[] = []): TransformedProduct {
  const getSizes = (varieties: ZureoVariety[]): string[] => {
    const sizes = new Set<string>()
    varieties.forEach((v) => {
      const sizeAttr = v.atributos.find(
        (a) => a.atributo.toLowerCase().includes("talle") || a.atributo.toLowerCase().includes("size"),
      )
      if (sizeAttr) sizes.add(sizeAttr.valor)
    })
    return Array.from(sizes)
  }

  const getColors = (varieties: ZureoVariety[]): { name: string; value: string }[] => {
    const colors = new Map<string, string>()
    varieties.forEach((v) => {
      const colorAttr = v.atributos.find((a) => a.atributo.toLowerCase().includes("color"))
      if (colorAttr) {
        colors.set(colorAttr.valor, colorAttr.valor.toLowerCase())
      }
    })
    return Array.from(colors.entries()).map(([name, value]) => ({ name, value }))
  }

  const totalStock = (product.variedades || []).reduce((acc, v) => acc + (v.stock || 0), product.stock || 0)

  // Procesar imágenes - usar placeholder si no hay imágenes
  let productImages: string[] = ["/placeholder.svg?height=400&width=400&text=Sin+Imagen"]

  if (images && Array.isArray(images) && images.length > 0) {
    productImages = images.filter((img) => img && img.base64).map((img) => `data:image/jpeg;base64,${img.base64}`)

    // Si no hay imágenes válidas, usar placeholder
    if (productImages.length === 0) {
      productImages = ["/placeholder.svg?height=400&width=400&text=Sin+Imagen"]
    }
  }

  // Usar el código como nombre si no hay nombre disponible
  const productTitle = product.nombre && product.nombre.trim() !== "" ? product.nombre : `Producto ${product.codigo}`

  return {
    id: String(product.id),
    handle: product.codigo,
    title: productTitle,
    description: product.descripcion_larga || product.descripcion_corta || "Descripción no disponible",
    price: product.precio || 0,
    compareAtPrice: null,
    inStock: totalStock > 0 && !product.baja, // No está en stock si está dado de baja
    stock: totalStock,
    brand: product.marca?.nombre || "Sin marca",
    category: product.tipo?.nombre || "Sin categoría",
    images: productImages,
    sizes: getSizes(product.variedades || []),
    colors: getColors(product.variedades || []),
    rating: 4.5,
    reviewCount: 12,
    isActive: !product.baja, // Nuevo campo para saber si está activo
  }
}

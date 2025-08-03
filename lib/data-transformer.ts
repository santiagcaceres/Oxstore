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
  if (!product) {
    throw new Error("Producto de Zureo no válido")
  }

  const getSizes = (varieties: ZureoVariety[]): string[] => {
    if (!varieties || !Array.isArray(varieties)) return []

    const sizes = new Set<string>()
    varieties.forEach((v) => {
      if (v && v.atributos && Array.isArray(v.atributos)) {
        const sizeAttr = v.atributos.find(
          (a) =>
            a &&
            a.atributo &&
            (a.atributo.toLowerCase().includes("talle") || a.atributo.toLowerCase().includes("size")),
        )
        if (sizeAttr && sizeAttr.valor) sizes.add(sizeAttr.valor)
      }
    })
    return Array.from(sizes)
  }

  const getColors = (varieties: ZureoVariety[]): { name: string; value: string }[] => {
    if (!varieties || !Array.isArray(varieties)) return []

    const colors = new Map<string, string>()
    varieties.forEach((v) => {
      if (v && v.atributos && Array.isArray(v.atributos)) {
        const colorAttr = v.atributos.find((a) => a && a.atributo && a.atributo.toLowerCase().includes("color"))
        if (colorAttr && colorAttr.valor) {
          colors.set(colorAttr.valor, colorAttr.valor.toLowerCase())
        }
      }
    })
    return Array.from(colors.entries()).map(([name, value]) => ({ name, value }))
  }

  const totalStock = (product.variedades || []).reduce(
    (acc, v) => {
      return acc + (v && typeof v.stock === "number" ? v.stock : 0)
    },
    typeof product.stock === "number" ? product.stock : 0,
  )

  // Procesar imágenes de manera segura
  let productImages: string[] = ["/placeholder.svg?height=400&width=400&text=Sin+Imagen"]

  if (images && Array.isArray(images) && images.length > 0) {
    const validImages = images
      .filter((img) => img && img.base64 && typeof img.base64 === "string")
      .map((img) => `data:image/jpeg;base64,${img.base64}`)

    if (validImages.length > 0) {
      productImages = validImages
    }
  }

  // Usar el código como nombre si no hay nombre disponible
  const productTitle =
    product.nombre && product.nombre.trim() !== ""
      ? product.nombre
      : `Producto ${product.codigo || product.id || "Sin código"}`

  return {
    id: String(product.id || Math.random()),
    handle: product.codigo || String(product.id || Math.random()),
    title: productTitle,
    description: product.descripcion_larga || product.descripcion_corta || "Descripción no disponible",
    price: typeof product.precio === "number" ? product.precio : 0,
    compareAtPrice: null,
    inStock: totalStock > 0 && !product.baja,
    stock: totalStock,
    brand: (product.marca && product.marca.nombre) || "Sin marca",
    category: (product.tipo && product.tipo.nombre) || "Sin categoría",
    images: productImages,
    sizes: getSizes(product.variedades || []),
    colors: getColors(product.variedades || []),
    rating: 4.5,
    reviewCount: 12,
    isActive: !product.baja,
  }
}

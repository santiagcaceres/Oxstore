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
}

// Transforma un producto de Zureo al formato unificado
export function transformZureoProduct(product: ZureoProduct, images: any[] = []): TransformedProduct {
  const getSizes = (varieties: ZureoVariety[]): string[] => {
    const sizes = new Set<string>()
    varieties.forEach((v) => {
      const sizeAttr = v.atributos.find((a) => a.atributo.toLowerCase() === "talle")
      if (sizeAttr) sizes.add(sizeAttr.valor)
    })
    return Array.from(sizes)
  }

  const getColors = (varieties: ZureoVariety[]): { name: string; value: string }[] => {
    const colors = new Map<string, string>()
    varieties.forEach((v) => {
      const colorAttr = v.atributos.find((a) => a.atributo.toLowerCase() === "color")
      if (colorAttr) {
        // Asume que el valor es el nombre. El `value` para el color real es más complejo.
        // Por ahora, usamos placeholders.
        colors.set(colorAttr.valor, colorAttr.valor.toLowerCase())
      }
    })
    return Array.from(colors.entries()).map(([name, value]) => ({ name, value }))
  }

  const totalStock = product.variedades.reduce((acc, v) => acc + v.stock, product.stock || 0)

  return {
    id: String(product.id),
    handle: product.codigo,
    title: product.nombre || "Nombre no disponible",
    description: product.descripcion_larga || "Descripción no disponible. Falta configurar en Zureo.",
    price: product.precio || 0,
    compareAtPrice: null, // Zureo API no parece tener este campo, se puede añadir lógica si existe
    inStock: totalStock > 0,
    stock: totalStock,
    brand: product.marca?.nombre || "Marca no disponible",
    category: product.tipo?.nombre || "Categoría no disponible",
    images: images.map((img) => `data:image/jpeg;base64,${img.base64}`),
    sizes: getSizes(product.variedades || []),
    colors: getColors(product.variedades || []),
    // Datos de ejemplo, ya que Zureo no los provee
    rating: 4.5,
    reviewCount: 12,
  }
}

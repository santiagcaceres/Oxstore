import type { Product } from "@/lib/database"

export const loadSimilarProducts = async (
  currentProduct: Product,
  setSimilarProducts: (products: Product[]) => void,
  setLoadingSimilar: (loading: boolean) => void,
) => {
  setLoadingSimilar(true)
  try {
    const currentZureoCode = currentProduct.zureo_code || currentProduct.sku

    // Buscar productos de la misma categoría
    const categoryResponse = await fetch(
      `/api/products?category=${encodeURIComponent(currentProduct.category || "")}&limit=50`,
    )

    // Buscar productos de la misma marca
    const brandResponse = await fetch(`/api/products?brand=${encodeURIComponent(currentProduct.brand || "")}&limit=50`)

    const [categoryData, brandData] = await Promise.all([
      categoryResponse.ok ? categoryResponse.json() : { products: [] },
      brandResponse.ok ? brandResponse.json() : { products: [] },
    ])

    // Combinar productos de categoría y marca
    const categoryProducts = categoryData.products || []
    const brandProducts = brandData.products || []
    const allProducts = [...categoryProducts, ...brandProducts]

    const productsByCode = new Map<string, Product[]>()

    allProducts.forEach((product) => {
      const zureoCode = product.zureo_code || product.sku

      // Excluir el producto actual
      if (zureoCode === currentZureoCode) return

      if (!productsByCode.has(zureoCode)) {
        productsByCode.set(zureoCode, [])
      }
      productsByCode.get(zureoCode)!.push(product)
    })

    // Convertir el Map a un array de productos representativos (uno por código)
    const uniqueProducts: Product[] = []
    productsByCode.forEach((variants, zureoCode) => {
      // Usar el primer producto como representante, pero agregar información de variantes
      const representative = { ...variants[0] }

      // Agregar información de todos los colores y talles disponibles
      const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))]
      const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))]

      // Agregar metadata de variantes al producto representativo
      representative.availableColors = colors
      representative.availableSizes = sizes
      representative.variantCount = variants.length

      uniqueProducts.push(representative)
    })

    // Priorizar productos que coincidan en categoría Y marca
    const sortedProducts = uniqueProducts.sort((a, b) => {
      const aMatchesBoth = a.category === currentProduct.category && a.brand === currentProduct.brand
      const bMatchesBoth = b.category === currentProduct.category && b.brand === currentProduct.brand
      if (aMatchesBoth && !bMatchesBoth) return -1
      if (!aMatchesBoth && bMatchesBoth) return 1
      return 0
    })

    setSimilarProducts(sortedProducts.slice(0, 8))
  } catch (error) {
    console.error("Error loading similar products:", error)
    setSimilarProducts([])
  } finally {
    setLoadingSimilar(false)
  }
}

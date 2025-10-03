import type { Product } from "@/lib/database"

export const loadSimilarProducts = async (
  currentProduct: Product,
  setSimilarProducts: (products: Product[]) => void,
  setLoadingSimilar: (loading: boolean) => void,
) => {
  setLoadingSimilar(true)
  try {
    // Buscar productos de la misma categoría
    const categoryResponse = await fetch(
      `/api/products?category=${encodeURIComponent(currentProduct.category || "")}&limit=8`,
    )

    // Buscar productos de la misma marca
    const brandResponse = await fetch(`/api/products?brand=${encodeURIComponent(currentProduct.brand || "")}&limit=8`)

    const [categoryData, brandData] = await Promise.all([
      categoryResponse.ok ? categoryResponse.json() : { products: [] },
      brandResponse.ok ? brandResponse.json() : { products: [] },
    ])

    // Combinar productos de categoría y marca, eliminando duplicados
    const categoryProducts = categoryData.products || []
    const brandProducts = brandData.products || []

    const allProducts = [...categoryProducts, ...brandProducts]
    const uniqueProducts = allProducts.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.id === product.id) && product.id !== currentProduct.id,
    )

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

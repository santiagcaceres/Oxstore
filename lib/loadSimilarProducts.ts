import type { Product } from "@/lib/database"

export const loadSimilarProducts = async (
  currentProduct: Product,
  setSimilarProducts: (products: Product[]) => void,
  setLoadingSimilar: (loading: boolean) => void,
) => {
  setLoadingSimilar(true)
  try {
    // Buscar productos de la misma categoría o marca, excluyendo el producto actual
    const response = await fetch(`/api/products?category=${currentProduct.category}&limit=4`)
    if (response.ok) {
      const data = await response.json()
      // Filtrar el producto actual de los resultados
      const filtered = data.products?.filter((p: Product) => p.id !== currentProduct.id) || []
      setSimilarProducts(filtered.slice(0, 4))
    }
  } catch (error) {
    console.error("Error loading similar products:", error)
  } finally {
    setLoadingSimilar(false)
  }
}

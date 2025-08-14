import { getProductsFromZureo, getStockBySucursal, getBrandsFromZureo } from "./zureo-api"
import type { ZureoProduct } from "@/types/zureo"

export interface EnhancedProduct extends ZureoProduct {
  stockBySucursal?: any[]
  totalStock?: number
  hasStock?: boolean
  brandInfo?: any
}

export async function combineProductsWithStock(filters?: {
  onSale?: boolean
  isNew?: boolean
  category?: string
  brand?: string
}): Promise<EnhancedProduct[]> {
  try {
    // Obtener productos usando endpoint oficial
    const products = await getProductsFromZureo({ qty: 5000, includeInactive: false })

    // Obtener stock por sucursal usando endpoint oficial
    const stockData = await getStockBySucursal(1, 1)

    // Obtener marcas usando endpoint oficial
    const brands = await getBrandsFromZureo()

    // Combinar datos internamente
    const enhancedProducts: EnhancedProduct[] = products.map((product) => {
      // Buscar stock para este producto
      const productStock = Array.isArray(stockData)
        ? stockData.filter((stock: any) => stock.id_producto === product.id)
        : []

      // Calcular stock total
      const totalStock = productStock.reduce((sum: number, stock: any) => sum + (stock.stock || 0), 0)

      // Buscar información de marca
      const brandInfo = Array.isArray(brands) ? brands.find((brand: any) => brand.id === product.marca?.id) : null

      return {
        ...product,
        stockBySucursal: productStock,
        totalStock,
        hasStock: totalStock > 0,
        brandInfo,
      }
    })

    // Aplicar filtros internamente
    let filteredProducts = enhancedProducts

    if (filters?.onSale) {
      // Filtrar productos en oferta (ejemplo: productos con descuento o precio especial)
      filteredProducts = filteredProducts.filter(
        (product) => product.precio_oferta && product.precio_oferta < product.precio,
      )
    }

    if (filters?.isNew) {
      // Filtrar productos nuevos (ejemplo: productos creados en los últimos 30 días)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      filteredProducts = filteredProducts.filter((product) => {
        if (!product.fecha_alta) return false
        const productDate = new Date(product.fecha_alta)
        return productDate >= thirtyDaysAgo
      })
    }

    if (filters?.category) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.rubro?.toLowerCase().includes(filters.category!.toLowerCase()) ||
          product.subrubro?.toLowerCase().includes(filters.category!.toLowerCase()),
      )
    }

    if (filters?.brand) {
      filteredProducts = filteredProducts.filter((product) =>
        product.marca?.nombre?.toLowerCase().includes(filters.brand!.toLowerCase()),
      )
    }

    // Solo devolver productos con stock
    return filteredProducts.filter((product) => product.hasStock)
  } catch (error) {
    console.error("Error combining products with stock:", error)
    return []
  }
}

export async function getSaleProducts(): Promise<EnhancedProduct[]> {
  return combineProductsWithStock({ onSale: true })
}

export async function getNewProducts(): Promise<EnhancedProduct[]> {
  return combineProductsWithStock({ isNew: true })
}

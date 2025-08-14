import { getProductsFromZureo, getStockBySucursal } from "./zureo-api"

export interface ProductWithStock {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  stockBySucursal: Array<{
    sucursal: number
    stock: number
  }>
  marca: {
    id: number
    nombre: string | null
  }
  tipo: {
    id: number
    nombre: string
  }
  categoria: string
  subcategoria: string
  activo: boolean
  fechaAlta?: string
  fechaModificacion?: string
  descuento?: number
  precioOriginal?: number
  esNuevo?: boolean
  diasDesdeAlta?: number
}

export async function combineProductsWithStock(
  filters: {
    onlyWithStock?: boolean
    onlyWithBrand?: boolean
    onlyActive?: boolean
    sucursales?: number[]
  } = {},
): Promise<ProductWithStock[]> {
  try {
    const { onlyWithStock = true, onlyWithBrand = false, onlyActive = true, sucursales = [1] } = filters

    const products = await getProductsFromZureo({
      qty: 5000,
      includeInactive: !onlyActive,
    })

    const productsWithStock: ProductWithStock[] = []

    for (const product of products) {
      try {
        // Obtener stock por cada sucursal
        const stockBySucursal = []
        let totalStock = 0

        for (const sucursal of sucursales) {
          try {
            const stockData = await getStockBySucursal(1, sucursal)
            const productStock = stockData.find((s: any) => s.codigo === product.codigo)
            const stock = productStock ? productStock.stock : 0

            stockBySucursal.push({
              sucursal,
              stock,
            })

            totalStock += stock
          } catch (error) {
            console.warn(`Error obteniendo stock para sucursal ${sucursal}:`, error)
            stockBySucursal.push({
              sucursal,
              stock: 0,
            })
          }
        }

        // Aplicar filtros
        if (onlyWithStock && totalStock === 0) continue
        if (onlyWithBrand && (!product.marca || !product.marca.nombre)) continue
        if (onlyActive && product.baja) continue

        const fechaAlta = product.fecha_alta ? new Date(product.fecha_alta) : null
        const ahora = new Date()
        const diasDesdeAlta = fechaAlta
          ? Math.floor((ahora.getTime() - fechaAlta.getTime()) / (1000 * 60 * 60 * 24))
          : null
        const esNuevo = diasDesdeAlta !== null && diasDesdeAlta <= 30

        const productWithStock: ProductWithStock = {
          id: product.id,
          codigo: product.codigo,
          nombre: product.nombre || product.descripcion || "Sin nombre",
          descripcion: product.descripcion || "",
          precio: product.precio || 0,
          stock: totalStock,
          stockBySucursal,
          marca: {
            id: product.marca?.id || 0,
            nombre: product.marca?.nombre || null,
          },
          tipo: {
            id: product.tipo?.id || 0,
            nombre: product.tipo?.nombre || "Sin categoría",
          },
          categoria: product.rubro || "Sin categoría",
          subcategoria: product.subrubro || "",
          activo: !product.baja,
          fechaAlta: product.fecha_alta,
          fechaModificacion: product.fecha_modificado,
          esNuevo,
          diasDesdeAlta: diasDesdeAlta || undefined,
        }

        productsWithStock.push(productWithStock)
      } catch (error) {
        console.warn(`Error procesando producto ${product.codigo}:`, error)
      }
    }

    return productsWithStock
  } catch (error) {
    console.error("Error combinando productos con stock:", error)
    return []
  }
}

export async function getNewProducts(): Promise<ProductWithStock[]> {
  const products = await combineProductsWithStock({
    onlyWithStock: true,
    onlyWithBrand: true,
    onlyActive: true,
    sucursales: [1],
  })

  return products.filter((product) => product.esNuevo).sort((a, b) => (a.diasDesdeAlta || 0) - (b.diasDesdeAlta || 0))
}

export async function getSaleProducts(): Promise<ProductWithStock[]> {
  const products = await combineProductsWithStock({
    onlyWithStock: true,
    onlyWithBrand: true,
    onlyActive: true,
    sucursales: [1],
  })

  // Cuando Zureo implemente descuentos, se puede filtrar por productos con descuento > 0
  return products.filter((product) => product.stock > 0).sort((a, b) => b.stock - a.stock) // Ordenar por stock descendente
}

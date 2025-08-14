import { getProductsFromZureo, getStockBySucursal } from "./zureo-api"
import { supabase } from "./supabase"
import { getProductImages } from "./supabase"
import type { ZureoProduct } from "@/types/zureo"

export interface EnhancedProduct extends ZureoProduct {
  images: Array<{
    id: string
    image_url: string
    is_primary: boolean
  }>
  custom_description?: string
  custom_title?: string
  seo_title?: string
  seo_description?: string
  tags?: string[]
  is_featured?: boolean
  stock_by_branch?: Array<{
    sucursal: string
    stock: number
  }>
}

export async function getProductsWithStock(): Promise<EnhancedProduct[]> {
  try {
    // Obtener productos de Zureo
    const zureoProducts = await getProductsFromZureo({ qty: 1000, includeInactive: false })

    // Filtrar productos con stock > 0
    const productsWithStock = zureoProducts.filter((product) => product.stock > 0)

    // Enriquecer con datos locales e imágenes
    const enhancedProducts = await Promise.all(
      productsWithStock.map(async (product) => {
        // Obtener imágenes del producto
        const images = await getProductImages(product.codigo)

        // Obtener datos locales si existen
        let localData = null
        if (supabase) {
          const { data } = await supabase.from("products").select("*").eq("product_code", product.codigo).single()
          localData = data
        }

        return {
          ...product,
          images: images || [],
          custom_description: localData?.custom_description,
          custom_title: localData?.custom_title,
          seo_title: localData?.seo_title,
          seo_description: localData?.seo_description,
          tags: localData?.tags || [],
          is_featured: localData?.is_featured || false,
        }
      }),
    )

    return enhancedProducts
  } catch (error) {
    console.error("Error getting products with stock:", error)
    return []
  }
}

export async function getProductsWithBrandAndStock(): Promise<EnhancedProduct[]> {
  try {
    const productsWithStock = await getProductsWithStock()

    // Filtrar solo productos que tienen marca
    return productsWithStock.filter(
      (product) => product.marca && product.marca.nombre && product.marca.nombre.trim() !== "",
    )
  } catch (error) {
    console.error("Error getting products with brand and stock:", error)
    return []
  }
}

export async function getProductStockBySucursal(productCode: string) {
  try {
    const stockData = await getStockBySucursal(productCode)
    return stockData
  } catch (error) {
    console.error("Error getting product stock by branch:", error)
    return []
  }
}

export async function upsertLocalProduct(productData: {
  product_code: string
  custom_description?: string
  custom_title?: string
  seo_title?: string
  seo_description?: string
  tags?: string[]
  is_featured?: boolean
}) {
  if (!supabase) {
    throw new Error("Supabase no está configurado")
  }

  const { data, error } = await supabase
    .from("products")
    .upsert(productData, { onConflict: "product_code" })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getEnhancedProduct(productCode: string): Promise<EnhancedProduct | null> {
  try {
    // Obtener producto de Zureo
    const zureoProducts = await getProductsFromZureo({ qty: 1000, includeInactive: true })
    const zureoProduct = zureoProducts.find((p) => p.codigo === productCode)

    if (!zureoProduct) return null

    // Obtener imágenes
    const images = await getProductImages(productCode)

    // Obtener datos locales
    let localData = null
    if (supabase) {
      const { data } = await supabase.from("products").select("*").eq("product_code", productCode).single()
      localData = data
    }

    // Obtener stock por sucursales
    const stockBySucursal = await getProductStockBySucursal(productCode)

    return {
      ...zureoProduct,
      images: images || [],
      custom_description: localData?.custom_description,
      custom_title: localData?.custom_title,
      seo_title: localData?.seo_title,
      seo_description: localData?.seo_description,
      tags: localData?.tags || [],
      is_featured: localData?.is_featured || false,
      stock_by_branch: stockBySucursal,
    }
  } catch (error) {
    console.error("Error getting enhanced product:", error)
    return null
  }
}

export async function searchProducts(query: string): Promise<EnhancedProduct[]> {
  try {
    const allProducts = await getProductsWithStock()

    const searchTerm = query.toLowerCase()

    return allProducts.filter(
      (product) =>
        product.codigo.toLowerCase().includes(searchTerm) ||
        product.nombre?.toLowerCase().includes(searchTerm) ||
        product.marca?.nombre?.toLowerCase().includes(searchTerm) ||
        product.custom_title?.toLowerCase().includes(searchTerm) ||
        product.custom_description?.toLowerCase().includes(searchTerm),
    )
  } catch (error) {
    console.error("Error searching products:", error)
    return []
  }
}

export async function getCompleteProducts(): Promise<EnhancedProduct[]> {
  try {
    const productsWithStock = await getProductsWithBrandAndStock()

    // Filtrar solo productos que tienen imagen (productos completos)
    const completeProducts = productsWithStock.filter((product) => product.images && product.images.length > 0)

    return completeProducts
  } catch (error) {
    console.error("Error getting complete products:", error)
    return []
  }
}

export async function createOrUpdateProduct(
  productCode: string,
  data: {
    custom_description?: string
    custom_title?: string
    seo_title?: string
    seo_description?: string
    tags?: string[]
    is_featured?: boolean
  },
) {
  try {
    const result = await upsertLocalProduct({
      product_code: productCode,
      ...data,
    })

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Error creating/updating product:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

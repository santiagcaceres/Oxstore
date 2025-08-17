import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface EnrichedProduct {
  // Datos de Zureo
  codigo: string
  nombre: string
  marca: string
  precio: number
  categoria: string
  descripcion: string
  activo: boolean
  stock?: number

  // Datos locales de Supabase
  custom_title?: string
  custom_description?: string
  seo_title?: string
  seo_description?: string
  is_featured?: boolean
  is_active?: boolean
  images?: Array<{
    id: string
    image_url: string
    is_primary: boolean
  }>
}

async function fetchZureoProducts() {
  try {
    const response = await fetch("/api/products/zureo")
    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error("Error fetching products from API:", error)
    return []
  }
}

async function fetchStockData() {
  try {
    const response = await fetch("/api/products/stock")
    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error("Error fetching stock from API:", error)
    return []
  }
}

export async function getEnrichedProducts(): Promise<EnrichedProduct[]> {
  try {
    const zureoProducts = await fetchZureoProducts()

    // Obtener datos locales de Supabase
    const { data: localProducts } = await supabase.from("products").select("*")
    const { data: productImages } = await supabase.from("product_images").select("*")

    // Combinar datos
    const enrichedProducts: EnrichedProduct[] = zureoProducts.map((product: any) => {
      const localData = localProducts?.find((p) => p.product_code === product.codigo)
      const images = productImages?.filter((img) => img.product_code === product.codigo) || []

      return {
        codigo: product.codigo,
        nombre: product.nombre || product.descripcion,
        marca: product.marca,
        precio: product.precio,
        categoria: product.categoria || product.rubro,
        descripcion: product.descripcion,
        activo: !product.baja,
        custom_title: localData?.custom_title,
        custom_description: localData?.custom_description,
        seo_title: localData?.seo_title,
        seo_description: localData?.seo_description,
        is_featured: localData?.is_featured || false,
        is_active: localData?.is_active !== false,
        images: images.map((img) => ({
          id: img.id,
          image_url: img.image_url,
          is_primary: img.is_primary,
        })),
      }
    })

    return enrichedProducts
  } catch (error) {
    console.error("Error getting enriched products:", error)
    return []
  }
}

export async function getProductsWithStock(): Promise<EnrichedProduct[]> {
  try {
    const products = await getEnrichedProducts()
    const stockData = await fetchStockData()

    return products
      .map((product) => ({
        ...product,
        stock: stockData.find((s: any) => s.codigo === product.codigo)?.stock || 0,
      }))
      .filter((product) => product.stock > 0)
  } catch (error) {
    console.error("Error getting products with stock:", error)
    return []
  }
}

export async function getCompleteProducts(): Promise<EnrichedProduct[]> {
  const products = await getEnrichedProducts()

  return products.filter(
    (product) =>
      product.marca &&
      product.nombre &&
      (product.descripcion || product.custom_description) &&
      product.images &&
      product.images.length > 0,
  )
}

export async function updateProductLocalData(
  productCode: string,
  data: {
    custom_title?: string
    custom_description?: string
    seo_title?: string
    seo_description?: string
    is_featured?: boolean
    is_active?: boolean
  },
) {
  const { error } = await supabase.from("products").upsert({
    product_code: productCode,
    ...data,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}

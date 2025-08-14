import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: any = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Función para verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
  return supabase !== null
}

// Funciones para gestión de usuarios
export async function createUser(email: string, password: string, userData: any) {
  if (!supabase) {
    throw new Error("Supabase no está configurado")
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })

  if (error) throw error
  return data
}

export async function loginUser(email: string, password: string) {
  if (!supabase) {
    throw new Error("Supabase no está configurado")
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function logoutUser() {
  if (!supabase) return

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function updateUserProfile(userId: string, updates: any) {
  if (!supabase) {
    throw new Error("Supabase no está configurado")
  }

  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId)

  if (error) throw error
  return data
}

export async function getUserProfile(userId: string) {
  if (!supabase) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}

// Funciones para gestión de pedidos
export async function createOrder(orderData: any) {
  if (!supabase) {
    throw new Error("Supabase no está configurado")
  }

  const { data, error } = await supabase.from("orders").insert(orderData).select().single()

  if (error) throw error
  return data
}

export async function getUserOrders(userId: string) {
  if (!supabase) return []

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user orders:", error)
    return []
  }

  return data || []
}

export async function getAllOrders() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching all orders:", error)
    return []
  }

  return data || []
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!supabase) {
    throw new Error("Supabase no está configurado")
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) throw error
  return data
}

// Funciones para gestión de imágenes de marcas
export async function uploadBrandImage(brandId: string, file: File) {
  if (!supabase) {
    throw new Error("Supabase no está configurado")
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `brand-${brandId}-${Date.now()}.${fileExt}`

  const { data: uploadData, error: uploadError } = await supabase.storage.from("images").upload(fileName, file)

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName)

  const { error: dbError } = await supabase.from("brand_images").upsert({
    brand_id: brandId,
    image_url: urlData.publicUrl,
    file_path: fileName,
    updated_at: new Date().toISOString(),
  })

  if (dbError) throw dbError

  return urlData.publicUrl
}

export async function getBrandImages(brandId?: string) {
  if (!supabase) return []

  let query = supabase.from("brand_images").select("*")

  if (brandId) {
    query = query.eq("brand_id", brandId)
  }

  const { data, error } = await query.order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching brand images:", error)
    return []
  }

  return data || []
}

export async function deleteBrandImage(brandId: string) {
  if (!supabase) return

  // Obtener la imagen actual para eliminar el archivo
  const images = await getBrandImages(brandId)

  for (const image of images) {
    if (image.file_path) {
      await supabase.storage.from("images").remove([image.file_path])
    }
  }

  const { error } = await supabase.from("brand_images").delete().eq("brand_id", brandId)

  if (error) {
    console.error("Error deleting brand image:", error)
    throw error
  }
}

// Funciones para gestión de imágenes de productos
export async function uploadProductImage(productCode: string, file: File) {
  if (!supabase) {
    throw new Error("Supabase no está configurado")
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `product-${productCode}-${Date.now()}.${fileExt}`

  const { data: uploadData, error: uploadError } = await supabase.storage.from("images").upload(fileName, file)

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName)

  const { error: dbError } = await supabase.from("product_images").insert({
    product_code: productCode,
    image_url: urlData.publicUrl,
    file_path: fileName,
    created_at: new Date().toISOString(),
  })

  if (dbError) throw dbError

  return urlData.publicUrl
}

export async function getProductImages(productCode: string) {
  if (!supabase) return []

  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_code", productCode)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching product images:", error)
    return []
  }

  return data || []
}

export async function deleteProductImage(imageId: string) {
  if (!supabase) return

  // Obtener la imagen para eliminar el archivo
  const { data: image } = await supabase.from("product_images").select("file_path").eq("id", imageId).single()

  if (image?.file_path) {
    await supabase.storage.from("images").remove([image.file_path])
  }

  const { error } = await supabase.from("product_images").delete().eq("id", imageId)

  if (error) {
    console.error("Error deleting product image:", error)
    throw error
  }
}

// Funciones para gestión de banners
export async function uploadBannerImage(
  file: File,
  bannerData: {
    title?: string
    description?: string
    link_url?: string
    banner_type?: "hero" | "category" | "promotional" | "product"
    banner_size?: "large" | "medium" | "small" | "square"
    display_order?: number
  },
) {
  if (!supabase) {
    throw new Error("Supabase no está configurado")
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `banner-${Date.now()}.${fileExt}`

  const { data: uploadData, error: uploadError } = await supabase.storage.from("images").upload(fileName, file)

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName)

  const { data, error: dbError } = await supabase
    .from("banners")
    .insert({
      image_url: urlData.publicUrl,
      file_path: fileName,
      title: bannerData.title || "Banner",
      description: bannerData.description || "",
      link_url: bannerData.link_url || "",
      banner_type: bannerData.banner_type || "hero",
      banner_size: bannerData.banner_size || "large",
      display_order: bannerData.display_order || 0,
      is_active: true,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (dbError) throw dbError

  return data
}

export async function getBannersByType(bannerType?: string) {
  if (!supabase) return []

  let query = supabase.from("banners").select("*").eq("is_active", true)

  if (bannerType) {
    query = query.eq("banner_type", bannerType)
  }

  const { data, error } = await query.order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching banners:", error)
    return []
  }

  return data || []
}

export async function updateBannerOrder(bannerId: string, newOrder: number) {
  if (!supabase) {
    throw new Error("Supabase no está configurado")
  }

  const { data, error } = await supabase.from("banners").update({ display_order: newOrder }).eq("id", bannerId)

  if (error) throw error
  return data
}

export async function getBanners() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching banners:", error)
    return []
  }

  return data || []
}

export async function deleteBanner(bannerId: string) {
  if (!supabase) return

  // Obtener el banner para eliminar el archivo
  const { data: banner } = await supabase.from("banners").select("file_path").eq("id", bannerId).single()

  if (banner?.file_path) {
    await supabase.storage.from("images").remove([banner.file_path])
  }

  const { error } = await supabase.from("banners").update({ is_active: false }).eq("id", bannerId)

  if (error) {
    console.error("Error deleting banner:", error)
    throw error
  }
}

// Funciones para gestión de productos locales
export async function createLocalProduct(productData: {
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

  const { data, error } = await supabase.from("products").insert(productData).select().single()

  if (error) throw error
  return data
}

export async function updateLocalProduct(
  productCode: string,
  updates: {
    custom_description?: string
    custom_title?: string
    seo_title?: string
    seo_description?: string
    tags?: string[]
    is_featured?: boolean
  },
) {
  if (!supabase) {
    throw new Error("Supabase no está configurado")
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("product_code", productCode)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getLocalProduct(productCode: string) {
  if (!supabase) return null

  const { data, error } = await supabase.from("products").select("*").eq("product_code", productCode).single()

  if (error) {
    console.error("Error fetching local product:", error)
    return null
  }

  return data
}

export async function getAllLocalProducts() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching local products:", error)
    return []
  }

  return data || []
}

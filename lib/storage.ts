import { createClient } from "@/lib/supabase/client"

export async function uploadImage(file: File, folder = "products") {
  const supabase = createClient()

  // Validar tipo de archivo
  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten archivos de imagen")
  }

  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("El archivo debe ser menor a 5MB")
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `${folder}-${Date.now()}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { data, error } = await supabase.storage.from("banners").upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
  })

  if (error) throw error

  // Obtener URL pública
  const { data: urlData } = supabase.storage.from("banners").getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function uploadBannerImage(file: File, bannerId: string) {
  const supabase = createClient()

  // Validar tipo de archivo
  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten archivos de imagen")
  }

  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("El archivo debe ser menor a 5MB")
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `banner-${bannerId}-${Date.now()}.${fileExt}`
  const filePath = `banners/${fileName}`

  const { data, error } = await supabase.storage.from("banners").upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
  })

  if (error) throw error

  // Obtener URL pública
  const { data: urlData } = supabase.storage.from("banners").getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function deleteBannerImage(imagePath: string) {
  const supabase = createClient()

  // Extraer el path del archivo de la URL completa
  const path = imagePath.split("/").slice(-2).join("/")

  const { error } = await supabase.storage.from("banners").remove([path])

  if (error) throw error
}

export const BANNER_SIZE_GUIDE = {
  hero: {
    desktop: { width: 1200, height: 400, ratio: "3:1" },
    mobile: { width: 800, height: 300, ratio: "8:3" },
    description: "Banner principal deslizable",
  },
  secondary: {
    desktop: { width: 1200, height: 200, ratio: "6:1" },
    mobile: { width: 800, height: 150, ratio: "16:3" },
    description: "Banner secundario horizontal",
  },
  category: {
    desktop: { width: 600, height: 400, ratio: "3:2" },
    mobile: { width: 400, height: 300, ratio: "4:3" },
    description: "Banners de categorías (jeans, canguros, remeras, buzos)",
  },
  gender: {
    desktop: { width: 600, height: 300, ratio: "2:1" },
    mobile: { width: 400, height: 200, ratio: "2:1" },
    description: "Banners de género (hombre/mujer)",
  },
  offers: {
    desktop: { width: 1200, height: 300, ratio: "4:1" },
    mobile: { width: 800, height: 200, ratio: "4:1" },
    description: "Banner de ofertas final",
  },
}

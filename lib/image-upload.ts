import { put } from "@vercel/blob"

export interface ImageUploadResult {
  url: string
  filename: string
  size: number
}

export async function uploadImageToBlob(file: File, folder = "products"): Promise<ImageUploadResult> {
  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split(".").pop()
    const filename = `${folder}/${timestamp}-${randomId}.${extension}`

    // Subir a Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return {
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
    }
  } catch (error) {
    console.error("Error uploading image to Blob:", error)
    throw new Error("Failed to upload image")
  }
}

export async function optimizeImage(file: File, maxWidth = 800, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
            resolve(optimizedFile)
          } else {
            resolve(file) // Fallback al archivo original
          }
        },
        "image/jpeg",
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

import { put } from "@vercel/blob"

export async function uploadImageToBlob(file: File, pathname: string) {
  try {
    const blob = await put(pathname, file, {
      access: "public",
    })

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
    }
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error)
    throw new Error("Failed to upload image")
  }
}

export async function optimizeImage(file: File, maxWidth = 800, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          const optimizedFile = new File([blob!], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          })
          resolve(optimizedFile)
        },
        "image/jpeg",
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

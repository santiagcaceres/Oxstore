export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Si el archivo es muy pequeño, no comprimir
    if (file.size < 1024 * 1024) {
      // Menos de 1MB
      resolve(file)
      return
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      try {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        const maxWidth = 1200
        const maxHeight = 1200

        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height)

        // Convertir a blob con compresión
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback al archivo original
            }
          },
          file.type,
          0.8, // Calidad 80%
        )
      } catch (error) {
        console.error("Error en compresión:", error)
        resolve(file) // Fallback al archivo original
      }
    }

    img.onerror = () => {
      console.error("Error cargando imagen para compresión")
      resolve(file) // Fallback al archivo original
    }

    img.src = URL.createObjectURL(file)
  })
}

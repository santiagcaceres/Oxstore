"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, ArrowLeft, ArrowRight, Star } from "lucide-react"
import { compressImage } from "@/lib/image-compression"
import Image from "next/image"

interface SimpleImageUploadProps {
  onImagesChange: (files: File[]) => void
  maxImages?: number
}

export function SimpleImageUpload({ onImagesChange, maxImages = 3 }: SimpleImageUploadProps) {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingIndex, setProcessingIndex] = useState<number | null>(null)

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      setIsProcessing(true)
      const newImages: File[] = []
      const newPreviews: string[] = []

      try {
        for (let i = 0; i < Math.min(files.length, maxImages - images.length); i++) {
          const file = files[i]

          // Validar tipo de archivo
          if (!file.type.startsWith("image/")) {
            console.warn(`Archivo ${file.name} no es una imagen válida`)
            continue
          }

          // Validar tamaño (máximo 50MB)
          if (file.size > 50 * 1024 * 1024) {
            console.warn(`Archivo ${file.name} es demasiado grande (máximo 50MB)`)
            continue
          }

          setProcessingIndex(i)

          try {
            // Comprimir imagen
            const compressedFile = await compressImage(file)

            // Crear preview
            const preview = await createPreview(compressedFile)

            newImages.push(compressedFile)
            newPreviews.push(preview)
          } catch (error) {
            console.error(`Error procesando ${file.name}:`, error)
            // Si falla la compresión, usar archivo original
            const preview = await createPreview(file)
            newImages.push(file)
            newPreviews.push(preview)
          }
        }

        const updatedImages = [...images, ...newImages]
        const updatedPreviews = [...previews, ...newPreviews]

        setImages(updatedImages)
        setPreviews(updatedPreviews)
        onImagesChange(updatedImages)
      } catch (error) {
        console.error("Error procesando imágenes:", error)
      } finally {
        setIsProcessing(false)
        setProcessingIndex(null)
      }
    },
    [images, previews, maxImages, onImagesChange],
  )

  const removeImage = useCallback(
    (index: number) => {
      const updatedImages = images.filter((_, i) => i !== index)
      const updatedPreviews = previews.filter((_, i) => i !== index)

      setImages(updatedImages)
      setPreviews(updatedPreviews)
      onImagesChange(updatedImages)
    },
    [images, previews, onImagesChange],
  )

  const moveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= images.length) return

      const newImages = [...images]
      const newPreviews = [...previews]

      // Intercambiar elementos
      const tempImage = newImages[fromIndex]
      const tempPreview = newPreviews[fromIndex]

      newImages[fromIndex] = newImages[toIndex]
      newPreviews[fromIndex] = newPreviews[toIndex]

      newImages[toIndex] = tempImage
      newPreviews[toIndex] = tempPreview

      setImages(newImages)
      setPreviews(newPreviews)
      onImagesChange(newImages)
    },
    [images, previews, onImagesChange],
  )

  const makeMainImage = useCallback(
    (index: number) => {
      if (index === 0) return // Ya es la principal

      const newImages = [...images]
      const newPreviews = [...previews]

      // Mover la imagen seleccionada al primer lugar
      const selectedImage = newImages.splice(index, 1)[0]
      const selectedPreview = newPreviews.splice(index, 1)[0]

      newImages.unshift(selectedImage)
      newPreviews.unshift(selectedPreview)

      setImages(newImages)
      setPreviews(newPreviews)
      onImagesChange(newImages)
    },
    [images, previews, onImagesChange],
  )

  return (
    <div className="space-y-4">
      {/* Área de subida */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="image-upload"
          disabled={isProcessing || images.length >= maxImages}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            {isProcessing ? "Procesando imágenes..." : "Haz clic para seleccionar imágenes"}
          </p>
          <p className="text-xs text-gray-500">
            {images.length}/{maxImages} imágenes • JPG, PNG, WebP, GIF
          </p>
        </label>
      </div>

      {/* Indicador de procesamiento */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-800">
              Optimizando imagen {processingIndex !== null ? processingIndex + 1 : ""}...
            </p>
          </div>
        </div>
      )}

      {/* Lista de imágenes */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Imágenes seleccionadas</h4>
            <p className="text-xs text-gray-500">La primera imagen será la principal</p>
          </div>

          {images.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {/* Preview de imagen */}
              <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {previews[index] && (
                  <Image
                    src={previews[index] || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
                {index === 0 && (
                  <div className="absolute top-1 left-1">
                    <Star className="w-3 h-3 text-blue-600 fill-current" />
                  </div>
                )}
              </div>

              {/* Información del archivo */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                  {index === 0 && <span className="text-blue-600 ml-2">(Principal)</span>}
                </p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>

              {/* Controles */}
              <div className="flex items-center space-x-1">
                {/* Botón para hacer principal */}
                {index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => makeMainImage(index)}
                    className="h-8 px-2 text-xs"
                  >
                    Principal
                  </Button>
                )}

                {/* Flechas de reordenamiento */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveImage(index, index - 1)}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="w-3 h-3" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveImage(index, index + 1)}
                  disabled={index === images.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <ArrowRight className="w-3 h-3" />
                </Button>

                {/* Botón eliminar */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      {images.length > 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">ℹ️ Información:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>La primera imagen se usa como imagen principal</li>
            <li>Usa las flechas ← → para reordenar</li>
            <li>Usa "Principal" para mover cualquier imagen al primer lugar</li>
            <li>Las imágenes se optimizan automáticamente</li>
          </ul>
        </div>
      )}
    </div>
  )
}

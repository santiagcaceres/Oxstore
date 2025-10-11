"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Trash2, Plus, Upload, AlertCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface MultipleImageUploadProps {
  onImagesSelect: (files: File[]) => void
  currentImages?: string[]
  maxImages?: number
  className?: string
  allowEdit?: boolean
}

export function MultipleImageUpload({
  onImagesSelect,
  currentImages = [],
  maxImages = 3,
  className = "",
  allowEdit = false,
}: MultipleImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Inicializar previews con imágenes actuales
  useEffect(() => {
    const validCurrentImages = currentImages.filter((img) => img && img.trim() !== "" && img !== "null")
    setPreviews(validCurrentImages)
    console.log("MultipleImageUpload - Current images:", validCurrentImages)
  }, [currentImages])

  const handleFilesSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setError("")

    const validFiles = Array.from(files)

    if (validFiles.length > maxImages) {
      setError(`Máximo ${maxImages} archivos permitidos`)
      return
    }

    try {
      // Crear previews
      const newPreviews = await Promise.all(
        validFiles.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = () => reject(new Error("Error al leer el archivo"))
            reader.readAsDataURL(file)
          })
        }),
      )

      setPreviews(newPreviews)
      setSelectedFiles(validFiles)
      onImagesSelect(validFiles)

      console.log("New files selected:", validFiles.length)
    } catch (err) {
      console.error("Error processing files:", err)
      setError("Error al procesar los archivos")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    handleFilesSelect(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    handleFilesSelect(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    const newFiles = selectedFiles.filter((_, i) => i !== index)

    setPreviews(newPreviews)
    setSelectedFiles(newFiles)
    onImagesSelect(newFiles)
    setError("")

    // Limpiar el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input file oculto */}
      <input ref={fileInputRef} type="file" accept="*/*" onChange={handleFileChange} multiple className="hidden" />

      {/* Mostrar error si existe */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Imágenes existentes */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            {allowEdit ? "Imágenes actuales (serán reemplazadas):" : "Nuevas imágenes seleccionadas:"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previews.map((preview, index) => (
              <div key={`preview-${index}`} className="relative group">
                <Image
                  src={preview || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover rounded-lg border"
                  onError={(e) => {
                    console.error("Error loading preview:", preview)
                    e.currentTarget.src = `https://placehold.co/300x200/E5E7EB/374151/jpeg?text=Error+cargando`
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {index === 0 ? "Principal" : `${index + 1} de ${maxImages}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Área de subida */}
      {(previews.length < maxImages || allowEdit) && (
        <div className="space-y-4">
          {/* Área de drag and drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging ? "border-gray-600 bg-gray-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragging ? "Suelta las imágenes aquí" : "Arrastra imágenes aquí"}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {allowEdit ? "Reemplazar todas las imágenes" : `${previews.length} de ${maxImages} imágenes`}
              </p>
              <p className="text-xs text-gray-400 mb-4">Cualquier formato • Cualquier tamaño</p>

              {/* Botón para seleccionar archivos - NEGRO */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
                className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
              >
                <Plus className="w-4 h-4 mr-2" />
                {allowEdit ? "Cambiar Todas las Imágenes" : "Seleccionar Imágenes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p>
          <strong>Consejos:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>La primera imagen será la imagen principal de la obra</li>
          <li>Máximo {maxImages} archivos por obra</li>
          <li>Cualquier formato de archivo soportado</li>
          <li>Sin límite de tamaño por archivo</li>
        </ul>
      </div>
    </div>
  )
}

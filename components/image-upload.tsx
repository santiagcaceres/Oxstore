"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadBannerImage, deleteBannerImage, BANNER_SIZE_GUIDE } from "@/lib/storage"
import { Upload, X, Info } from "lucide-react"

interface ImageUploadProps {
  bannerId: string
  currentImageUrl?: string
  bannerPosition: string
  onImageUploaded: (url: string) => void
  onImageDeleted: () => void
}

export default function ImageUpload({
  bannerId,
  currentImageUrl,
  bannerPosition,
  onImageUploaded,
  onImageDeleted,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Obtener guía de tamaños según la posición
  const getSizeGuide = () => {
    if (bannerPosition.startsWith("category-")) return BANNER_SIZE_GUIDE.category
    if (bannerPosition.startsWith("gender-")) return BANNER_SIZE_GUIDE.gender
    return BANNER_SIZE_GUIDE[bannerPosition as keyof typeof BANNER_SIZE_GUIDE] || BANNER_SIZE_GUIDE.hero
  }

  const sizeGuide = getSizeGuide()

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)

      // Eliminar imagen anterior si existe
      if (currentImageUrl && !currentImageUrl.includes("placeholder.svg")) {
        await deleteBannerImage(currentImageUrl)
      }

      const newImageUrl = await uploadBannerImage(file, bannerId)
      onImageUploaded(newImageUrl)
    } catch (error) {
      alert("Error subiendo imagen: " + (error as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)

    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file)
    }
  }

  const handleDeleteImage = async () => {
    if (!currentImageUrl || currentImageUrl.includes("placeholder.svg")) return

    try {
      await deleteBannerImage(currentImageUrl)
      onImageDeleted()
    } catch (error) {
      alert("Error eliminando imagen: " + (error as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Guía de tamaños */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Tamaños recomendados</span>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <div>
            <strong>Desktop:</strong> {sizeGuide.desktop.width}x{sizeGuide.desktop.height}px ({sizeGuide.desktop.ratio})
          </div>
          <div>
            <strong>Mobile:</strong> {sizeGuide.mobile.width}x{sizeGuide.mobile.height}px ({sizeGuide.mobile.ratio})
          </div>
          <div>
            <strong>Formato:</strong> JPG, PNG, WebP (máx. 5MB)
          </div>
        </div>
      </div>

      {/* Vista previa de imagen actual */}
      {currentImageUrl && (
        <div className="relative">
          <img
            src={currentImageUrl || "/placeholder.svg"}
            alt="Banner actual"
            className="w-full h-32 object-cover rounded-lg border"
          />
          {!currentImageUrl.includes("placeholder.svg") && (
            <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleDeleteImage}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Área de subida */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">Arrastra una imagen aquí o haz clic para seleccionar</p>

        <Label htmlFor={`file-${bannerId}`}>
          <Button variant="outline" disabled={uploading} asChild>
            <span>{uploading ? "Subiendo..." : "Seleccionar imagen"}</span>
          </Button>
        </Label>

        <Input
          id={`file-${bannerId}`}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </div>
    </div>
  )
}

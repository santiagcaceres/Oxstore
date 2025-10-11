"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ArtworkGalleryProps {
  images: string[]
  title: string
}

export default function ArtworkGallery({ images, title }: ArtworkGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageKey, setImageKey] = useState(0)

  // Filtrar imágenes válidas y eliminar duplicados
  const validImages = images.filter((img, index, arr) => {
    const isValid = img && img.trim() !== "" && img !== "null" && img !== "undefined"
    const isUnique = arr.indexOf(img) === index
    return isValid && isUnique
  })

  // Debug log
  useEffect(() => {
    console.log("ArtworkGallery - Raw images:", images)
    console.log("ArtworkGallery - Valid images:", validImages)
  }, [images, validImages])

  // Reset index if it's out of bounds
  useEffect(() => {
    if (currentImageIndex >= validImages.length && validImages.length > 0) {
      setCurrentImageIndex(0)
    }
  }, [validImages.length, currentImageIndex])

  if (!validImages || validImages.length === 0) {
    console.log("No valid images found, showing placeholder")
    return (
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
        <Image
          src={`https://placehold.co/800x600/E5E7EB/374151/jpeg?text=${encodeURIComponent(title) || "Sin imagen"}`}
          alt={title}
          width={800}
          height={600}
          className="object-contain max-w-full max-h-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
          Sin imágenes
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length)
    setImageKey((prev) => prev + 1) // Forzar recarga de la nueva imagen
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
    setImageKey((prev) => prev + 1) // Forzar recarga de la nueva imagen
  }

  const reloadImage = () => {
    setImageKey((prev) => prev + 1) // Incrementar key para forzar recarga
    console.log("Recargando imagen:", validImages[currentImageIndex])
  }

  return (
    <div className="w-full">
      {/* Imagen principal - TAMAÑO ORIGINAL SIN CONTENEDOR FIJO */}
      <div
        className="relative w-full group cursor-pointer bg-gray-50 rounded-lg overflow-hidden shadow-xl"
        onClick={reloadImage}
      >
        <Image
          key={`${currentImageIndex}-${imageKey}`} // Key única para forzar recarga
          src={validImages[currentImageIndex] || "/placeholder.svg"}
          alt={`${title} - Imagen ${currentImageIndex + 1}`}
          width={1200} // Ancho máximo
          height={800} // Alto máximo
          className="w-full h-auto object-contain max-w-full" // CLAVE: h-auto + object-contain + max-w-full
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          quality={100}
          unoptimized={false}
          onError={(e) => {
            console.error("Error loading image:", validImages[currentImageIndex])
            e.currentTarget.src = `https://placehold.co/800x600/E5E7EB/374141/jpeg?text=Error+cargando+imagen`
          }}
          onLoad={() => {
            console.log("Imagen cargada exitosamente:", validImages[currentImageIndex])
          }}
        />

        {/* Navegación con flechas solo si hay más de 1 imagen */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Contador de imágenes */}
        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
          {validImages.length > 1 ? `${currentImageIndex + 1} / ${validImages.length}` : "Vista completa"}
        </div>
      </div>

      {/* Información */}
      <div className="mt-4 text-sm text-gray-600 text-center bg-gray-50 p-3 rounded-lg">
        {validImages.length > 1
          ? `Haz clic en la imagen para recargarla si no se ve correctamente • ${validImages.length} imágenes disponibles`
          : "Haz clic en la imagen para recargarla si no se ve correctamente"}
      </div>
    </div>
  )
}

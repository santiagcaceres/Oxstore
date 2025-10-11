"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  currentIndex: number
  title: string
}

export function ImageModal({ isOpen, onClose, images, currentIndex, title }: ImageModalProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex)

  useEffect(() => {
    setActiveIndex(currentIndex)
  }, [currentIndex])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          goToPrevious()
          break
        case "ArrowRight":
          goToNext()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, activeIndex])

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm">
      {/* Header con controles */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-300">
              Imagen {activeIndex + 1} de {images.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Imagen principal */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pt-20 pb-16">
        <div className="relative max-w-full max-h-full">
          <Image
            src={images[activeIndex] || "/placeholder.svg"}
            alt={`${title} - Imagen ${activeIndex + 1}`}
            width={1200}
            height={800}
            className="w-auto h-auto max-w-full max-h-full object-contain"
            priority
            quality={100}
            onError={(e) => {
              console.error("Error loading modal image:", images[activeIndex])
              e.currentTarget.src = `https://placehold.co/800x600/E5E7EB/374151/jpeg?text=Error+cargando+imagen`
            }}
          />
        </div>
      </div>

      {/* Controles de navegación - solo si hay más de 1 imagen */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Footer con miniaturas - solo si hay más de 1 imagen */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex justify-center gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={`modal-thumb-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`relative flex-shrink-0 w-16 h-12 rounded border-2 transition-all overflow-hidden ${
                  index === activeIndex ? "border-white ring-2 ring-white/50" : "border-white/30 hover:border-white/60"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay para cerrar al hacer click fuera */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Instrucciones */}
      <div className="absolute bottom-4 left-4 text-white/70 text-xs">
        <p>ESC para cerrar • ← → para navegar</p>
      </div>
    </div>
  )
}

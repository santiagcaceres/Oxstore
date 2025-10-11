"use client"

import { useEffect, useState } from "react"
import { CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessPopupProps {
  isOpen: boolean
  title: string
  message: string
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export function SuccessPopup({
  isOpen,
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 2000,
}: SuccessPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose()
        }, autoCloseDelay)
        return () => clearTimeout(timer)
      }
    }
  }, [isOpen, autoClose, autoCloseDelay])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300) // Esperar a que termine la animación
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`relative bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>

          {!autoClose && (
            <Button onClick={handleClose} className="bg-gray-900 hover:bg-gray-800 text-white">
              Cerrar
            </Button>
          )}

          {autoClose && <div className="text-sm text-gray-500">Cerrando automáticamente...</div>}
        </div>

        {/* Botón X para cerrar manualmente */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

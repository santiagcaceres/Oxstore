"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PopupBanner {
  id: string
  title: string
  description: string
  image_url: string
  link_url: string
  is_active: boolean
}

export default function PopupBanner() {
  const [banner, setBanner] = useState<PopupBanner | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadPopupBanner = async () => {
      try {
        // Use mock data instead of Supabase call
        const mockBanner: PopupBanner = {
          id: "popup-1",
          title: "¡10% de Descuento!",
          description: "Suscríbete a nuestro newsletter y obtén un 10% de descuento en tu primera compra",
          image_url: "/placeholder.svg?height=200&width=400&text=10%+OFF",
          link_url: "/",
          is_active: true,
        }

        setBanner(mockBanner)

        // Mostrar popup después de 2 segundos si no se ha mostrado antes
        const hasSeenPopup = localStorage.getItem("oxstore-popup-seen")
        if (!hasSeenPopup) {
          setTimeout(() => {
            setIsVisible(true)
          }, 2000)
        }
      } catch (error) {
        console.warn("Error loading popup banner:", error)
      }
    }

    loadPopupBanner()
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem("oxstore-popup-seen", "true")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("Email suscrito:", email)

      // Simular envío
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert("¡Gracias por suscribirte! Recibirás tu descuento por email.")
      handleClose()
    } catch (error) {
      console.warn("Error subscribing:", error)
      alert("Error al suscribirse. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!banner || !isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full relative overflow-hidden shadow-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="relative h-48 w-full">
          <Image src={banner.image_url || "/placeholder.svg"} alt={banner.title} fill className="object-cover" />
        </div>

        <div className="p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{banner.title}</h3>
          <p className="text-gray-600 mb-6">{banner.description}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={isSubmitting}>
              {isSubmitting ? "Suscribiendo..." : "Obtener Descuento"}
            </Button>
          </form>

          <button onClick={handleClose} className="text-sm text-gray-500 hover:text-gray-700 mt-4 underline">
            No gracias, continuar navegando
          </button>
        </div>
      </div>
    </div>
  )
}

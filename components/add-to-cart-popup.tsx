"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingCart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddToCartPopupProps {
  isVisible: boolean
  onClose: () => void
  product: {
    id: string
    title: string
    price: number
    image: string
    quantity: number
    selectedSize: string
    selectedColor: string
  }
}

export default function AddToCartPopup({ isVisible, onClose, product }: AddToCartPopupProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000) // Auto close after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
            <p className="text-sm text-gray-600">
              {product.selectedSize} - {product.selectedColor}
            </p>
            <p className="text-sm text-gray-600">Cantidad: {product.quantity}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-bold text-blue-950">${product.price}</span>
          <div className="flex items-center text-green-600">
            <ShoppingCart className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">¡Agregado al carrito!</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            <Eye className="h-4 w-4 mr-2" />
            Seguir comprando
          </Button>
          <Link href="/carrito" className="flex-1">
            <Button className="w-full bg-blue-950 hover:bg-blue-900">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ver carrito
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

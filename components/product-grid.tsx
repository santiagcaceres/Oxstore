"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart } from "lucide-react"

interface Product {
  id: number
  title: string
  handle: string
  price: number
  compareAtPrice?: number
  images: string[]
  brand: string
  category: string
  isNew?: boolean
  isOnSale?: boolean
  stock: number
  isActive: boolean
}

interface ProductGridProps {
  products: Product[]
  showFilters?: boolean
}

export default function ProductGrid({ products, showFilters = true }: ProductGridProps) {
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">No se encontraron productos.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <Link href={`/producto/${product.handle}`}>
              <Image
                src={product.images[0] || "/placeholder.svg?height=400&width=400&text=Sin+Imagen"}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.isNew && <Badge className="bg-green-500 text-white">Nuevo</Badge>}
              {product.isOnSale && <Badge className="bg-red-500 text-white">Oferta</Badge>}
              {product.stock === 0 && <Badge className="bg-gray-500 text-white">Sin Stock</Badge>}
            </div>

            {/* Favorite button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white"
              onClick={() => toggleFavorite(product.id)}
            >
              <Heart
                className={`h-4 w-4 ${favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
              />
            </Button>
          </div>

          <div className="p-4">
            <div className="mb-2">
              <p className="text-sm text-gray-500">{product.brand}</p>
              <Link href={`/producto/${product.handle}`}>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                  {product.title}
                </h3>
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900">${product.price}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">${product.compareAtPrice}</span>
                )}
              </div>

              <Button size="sm" disabled={product.stock === 0} className="bg-blue-950 hover:bg-blue-900">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>

            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-xs text-orange-600 mt-2">¡Solo quedan {product.stock}!</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

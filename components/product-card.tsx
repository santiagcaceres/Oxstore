"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/database"
import { useCart } from "@/contexts/cart-context"

interface ProductCardProps {
  product: Product
  className?: string
  index?: number
}

export function ProductCard({ product, className = "", index = 0 }: ProductCardProps) {
  const { addItem } = useCart()
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
  const hasDiscount = product.compare_price && product.compare_price > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0

  const animationDelay = `stagger-${Math.min(index + 1, 6)}`

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock_quantity > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: primaryImage?.image_url || "/placeholder.svg",
        slug: product.slug,
      })
    }
  }

  return (
    <div
      className={`group relative bg-card rounded-lg overflow-hidden hover-lift hover-glow animate-fade-in-up ${animationDelay} ${className}`}
    >
      {/* Product Image */}
      <Link href={`/producto/${product.slug}`} className="block relative aspect-square overflow-hidden">
        <Image
          src={primaryImage?.image_url || "/placeholder.svg?height=400&width=400"}
          alt={primaryImage?.alt_text || product.name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs animate-pulse-glow">
              -{discountPercentage}%
            </Badge>
          )}
          {product.stock_quantity === 0 && (
            <Badge variant="outline" className="text-xs bg-muted">
              Agotado
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <Button size="icon" variant="secondary" className="h-8 w-8 mb-1 hover-scale">
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide hover-slide transition-all duration-300">
            {product.brand}
          </p>
          <Link href={`/producto/${product.slug}`}>
            <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg transition-all duration-300 group-hover:text-primary">
            ${product.price}
          </span>
          {hasDiscount && <span className="text-sm text-muted-foreground line-through">${product.compare_price}</span>}
        </div>

        {/* Add to Cart Button */}
        <Button
          className="w-full mt-3 btn-press transition-all duration-300 hover:shadow-lg"
          size="sm"
          disabled={product.stock_quantity === 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
          {product.stock_quantity === 0 ? "Agotado" : "Agregar al Carrito"}
        </Button>
      </div>
    </div>
  )
}

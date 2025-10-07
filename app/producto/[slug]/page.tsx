"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/database"
import { useCart } from "@/contexts/cart-context"
import { loadSimilarProducts } from "@/lib/loadSimilarProducts" // Import the loadSimilarProducts function

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [availableVariants, setAvailableVariants] = useState<any[]>([])
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)
  const [imagesByColor, setImagesByColor] = useState<{ [key: string]: string }>({})
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        console.log(`[v0] Loading product with slug: ${params.slug}`)
        const response = await fetch(`/api/products/${params.slug}`)
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Product data received:", data)
          console.log("[v0] Variants in product data:", data.variants)

          setProduct(data)
          if (data.imagesByColor) {
            setImagesByColor(data.imagesByColor)
          }
          if (data.variants && data.variants.length > 0) {
            setAvailableVariants(data.variants)
            console.log("[v0] Available variants set:", data.variants)

            const colors = data.variants
              .map((v: any) => v.color)
              .filter((color: string, index: number, arr: string[]) => color && arr.indexOf(color) === index)
            const sizes = data.variants
              .map((v: any) => v.size)
              .filter((size: string, index: number, arr: string[]) => size && arr.indexOf(size) === index)

            console.log("[v0] Processed available colors:", colors)
            console.log("[v0] Processed available sizes:", sizes)

            if (data.variants.length > 0) {
              const firstVariant = data.variants[0]
              setSelectedVariant(firstVariant)
              if (firstVariant.color) setSelectedColor(firstVariant.color)
              if (firstVariant.size) setSelectedSize(firstVariant.size)
            }
          } else {
            console.log("[v0] No variants found in product data")
          }

          loadSimilarProducts(data, setSimilarProducts, setLoadingSimilar)
        } else {
          console.error(`[v0] Failed to load product: ${response.status}`)
          notFound()
        }
      } catch (error) {
        console.error("[v0] Error loading product:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.slug])

  useEffect(() => {
    if (availableVariants.length > 0) {
      const matchingVariant = availableVariants.find(
        (v) => (!selectedColor || v.color === selectedColor) && (!selectedSize || v.size === selectedSize),
      )
      if (matchingVariant) {
        setSelectedVariant(matchingVariant)
        console.log("[v0] Selected variant updated:", matchingVariant)

        if (matchingVariant.color && imagesByColor[matchingVariant.color]) {
          const newImages = [
            {
              id: 1,
              image_url: imagesByColor[matchingVariant.color],
              alt_text: product?.name || "",
            },
          ]
          setProduct((prev) => (prev ? { ...prev, images: newImages } : null))
          setSelectedImage(0)
        }
      }
    }
  }, [selectedColor, selectedSize, availableVariants, imagesByColor, product?.name])

  const getAvailableColors = () => {
    const colors = availableVariants
      .map((v) => v.color)
      .filter((color, index, arr) => color && arr.indexOf(color) === index)
    console.log("[v0] Available colors calculated:", colors)
    return colors
  }

  const getAvailableSizes = () => {
    const filteredVariants = selectedColor
      ? availableVariants.filter((v) => v.color === selectedColor)
      : availableVariants

    const sizes = filteredVariants.map((v) => v.size).filter((size, index, arr) => size && arr.indexOf(size) === index)
    console.log("[v0] Available sizes calculated:", sizes)
    return sizes
  }

  const getAvailableStock = () => {
    if (selectedVariant) {
      return selectedVariant.stock_quantity
    }
    return product?.stock_quantity || 0
  }

  const getCurrentPrice = () => {
    if (selectedVariant && selectedVariant.price) {
      return selectedVariant.price
    }
    return product?.price || 0
  }
  ;<div className="space-y-4">
    {availableVariants.length > 0 && getAvailableColors().length > 0 && (
      <div className="space-y-3">
        <label className="text-sm font-medium uppercase tracking-wide">Color:</label>
        <div className="flex flex-wrap gap-2">
          {getAvailableColors().map((color) => {
            const colorVariants = availableVariants.filter((v) => v.color === color)
            const hasStock = colorVariants.some((v) => v.stock_quantity > 0)

            return (
              <Badge
                key={color}
                variant={selectedColor === color ? "default" : "outline"}
                className={`cursor-pointer hover:bg-primary/10 transition-colors ${
                  !hasStock ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (hasStock) {
                    setSelectedColor(color)
                    setSelectedSize("")
                  }
                }}
              >
                {color.toUpperCase()}
              </Badge>
            )
          })}
        </div>
        {selectedColor && (
          <p className="text-sm text-muted-foreground">
            Color seleccionado: <span className="font-medium">{selectedColor.toUpperCase()}</span>
          </p>
        )}
      </div>
    )}

    {availableVariants.length > 0 && getAvailableSizes().length > 0 && (
      <div className="space-y-3">
        <label className="text-sm font-medium uppercase tracking-wide">Talle:</label>
        <div className="flex flex-wrap gap-2">
          {getAvailableSizes().map((size) => {
            const sizeVariants = availableVariants.filter(
              (v) => v.size === size && (!selectedColor || v.color === selectedColor),
            )
            const hasStock = sizeVariants.some((v) => v.stock_quantity > 0)

            return (
              <Badge
                key={size}
                variant={selectedSize === size ? "default" : "outline"}
                className={`cursor-pointer hover:bg-primary/10 transition-colors ${
                  !hasStock ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => hasStock && setSelectedSize(size)}
              >
                {size.toUpperCase()}
              </Badge>
            )
          })}
        </div>
        {selectedSize && (
          <p className="text-sm text-muted-foreground">
            Talle seleccionado: <span className="font-medium">{selectedSize.toUpperCase()}</span>
          </p>
        )}
      </div>
    )}
  </div>
}

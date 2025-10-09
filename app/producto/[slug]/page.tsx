"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingCart, Heart, Share2 } from "lucide-react"
import type { Product } from "@/lib/database"
import { useCart } from "@/contexts/cart-context"
import { loadSimilarProducts } from "@/lib/loadSimilarProducts"
import { ProductCard } from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"

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

  const handleAddToCart = async () => {
    if (!product) return

    if (availableVariants.length > 0) {
      if (getAvailableColors().length > 0 && !selectedColor) {
        alert("Por favor selecciona un color")
        return
      }
      if (getAvailableSizes().length > 0 && !selectedSize) {
        alert("Por favor selecciona un talle")
        return
      }
    }

    setIsAddingToCart(true)
    try {
      const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
      addItem({
        id: selectedVariant?.id || product.id,
        name: product.name,
        price: getCurrentPrice(),
        image: primaryImage?.image_url || "/placeholder.svg",
        slug: product.slug,
        size: selectedSize,
        color: selectedColor,
        quantity,
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return notFound()
  }

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
  const hasDiscount = product.sale_price && product.sale_price < product.price && product.discount_percentage > 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          {/* Imagen principal */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={
                product.images && product.images[selectedImage]
                  ? product.images[selectedImage].image_url
                  : primaryImage?.image_url || "/placeholder.svg?height=600&width=600"
              }
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {hasDiscount && (
              <Badge variant="destructive" className="absolute top-4 left-4 text-lg">
                -{product.discount_percentage}%
              </Badge>
            )}
          </div>

          {/* Miniaturas */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                    selectedImage === index ? "border-primary" : "border-transparent hover:border-muted-foreground"
                  }`}
                >
                  <Image
                    src={image.image_url || "/placeholder.svg"}
                    alt={image.alt_text || product.name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Marca y nombre */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">{product.brand}</p>
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          {/* Precio */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">${getCurrentPrice()}</span>
            {hasDiscount && <span className="text-xl text-muted-foreground line-through">${product.price}</span>}
          </div>

          {/* Descripción */}
          {product.description && (
            <div className="prose prose-sm">
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          {/* Selectores de variantes */}
          <div className="space-y-4">
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

          {/* Stock disponible */}
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${getAvailableStock() > 0 ? "bg-green-500" : "bg-red-500"} animate-pulse`}
            />
            <span className="text-sm text-muted-foreground">
              {getAvailableStock() > 0 ? `${getAvailableStock()} unidades disponibles` : "Sin stock"}
            </span>
          </div>

          {/* Selector de cantidad */}
          <div className="space-y-3">
            <label className="text-sm font-medium uppercase tracking-wide">Cantidad:</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-medium w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(getAvailableStock(), quantity + 1))}
                disabled={quantity >= getAvailableStock()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleAddToCart}
              disabled={getAvailableStock() === 0 || isAddingToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isAddingToCart ? "Agregando..." : "Agregar al Carrito"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="flex-1 bg-transparent">
                <Heart className="h-5 w-5 mr-2" />
                Favoritos
              </Button>
              <Button variant="outline" size="lg" className="flex-1 bg-transparent">
                <Share2 className="h-5 w-5 mr-2" />
                Compartir
              </Button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="border-t pt-6 space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium">SKU:</span> {product.sku}
            </p>
            <p>
              <span className="font-medium">Categoría:</span> {product.category || "Sin categoría"}
            </p>
            <p>
              <span className="font-medium">Marca:</span> {product.brand}
            </p>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos Similares</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
        </div>
      )}

      {loadingSimilar && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos Similares</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

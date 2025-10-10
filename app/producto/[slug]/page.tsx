"use client"

import { useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingCart, Heart, Share2, ArrowLeft, Ruler, Truck } from "lucide-react"
import type { Product } from "@/lib/database"
import { useCart } from "@/contexts/cart-context"
import { loadSimilarProducts } from "@/lib/loadSimilarProducts"
import { ProductCard } from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter()
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
  const [originalImages, setOriginalImages] = useState<any[]>([])
  const [sizeGuideUrl, setSizeGuideUrl] = useState<string | null>(null)
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`)
        if (response.ok) {
          const data = await response.json()

          setProduct(data)
          if (data.images) {
            setOriginalImages(data.images)
          }
          if (data.imagesByColor) {
            setImagesByColor(data.imagesByColor)
          }
          if (data.variants && data.variants.length > 0) {
            setAvailableVariants(data.variants)

            if (data.variants.length > 0) {
              const firstVariant = data.variants[0]
              setSelectedVariant(firstVariant)
              if (firstVariant.color) setSelectedColor(firstVariant.color)
              if (firstVariant.size) setSelectedSize(firstVariant.size)
            }
          }

          if (data.brand) {
            const sizeGuideResponse = await fetch(`/api/size-guides/${encodeURIComponent(data.brand)}`)
            if (sizeGuideResponse.ok) {
              const sizeGuideData = await sizeGuideResponse.json()
              setSizeGuideUrl(sizeGuideData.image_url)
            }
          }

          loadSimilarProducts(data, setSimilarProducts, setLoadingSimilar)
        } else {
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

        // Si hay imagen específica para este color, usarla
        if (matchingVariant.color && imagesByColor[matchingVariant.color]) {
          const newImages = [
            {
              id: 1,
              image_url: imagesByColor[matchingVariant.color],
              alt_text: product?.name || "",
              is_primary: true,
            },
          ]
          if (product) {
            setProduct({ ...product, images: newImages })
          }
          setSelectedImage(0)
        } else if (originalImages.length > 0 && product) {
          // Restaurar imágenes originales si no hay imagen específica
          setProduct({ ...product, images: originalImages })
          setSelectedImage(0)
        }
      }
    }
  }, [selectedColor, selectedSize, availableVariants, imagesByColor, originalImages])

  const getAvailableColors = () => {
    const colors = availableVariants
      .map((v) => v.color)
      .filter((color, index, arr) => color && arr.indexOf(color) === index)
    return colors
  }

  const getAvailableSizes = () => {
    const filteredVariants = selectedColor
      ? availableVariants.filter((v) => v.color === selectedColor)
      : availableVariants

    const sizes = filteredVariants.map((v) => v.size).filter((size, index, arr) => size && arr.indexOf(size) === index)
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
      <Button variant="ghost" onClick={() => router.push("/")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al inicio
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          {/* Imagen principal */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {product.images && product.images[selectedImage] ? (
              <Image
                key={`${product.images[selectedImage].image_url}-${selectedImage}`}
                src={product.images[selectedImage].image_url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <Image
                src={primaryImage?.image_url || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            )}
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
                  key={`${image.id}-${index}`}
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
                    unoptimized
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

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Tiempos de envío estimados</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  • CABA y GBA: 2-4 días hábiles
                  <br />• Interior del país: 5-7 días hábiles
                  <br />• Envío gratis en compras superiores a $50.000
                </p>
              </div>
            </div>
          </div>

          {/* Selectores de variantes */}
          <div className="space-y-4">
            {availableVariants.length > 0 && getAvailableColors().length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium uppercase tracking-wide">Color</label>
                  {selectedColor && (
                    <span className="text-sm font-medium text-primary">{selectedColor.toUpperCase()}</span>
                  )}
                </div>
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
              </div>
            )}

            {availableVariants.length > 0 && getAvailableSizes().length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium uppercase tracking-wide">Talle</label>
                  {selectedSize && (
                    <span className="text-sm font-medium text-primary">{selectedSize.toUpperCase()}</span>
                  )}
                </div>
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
                {sizeGuideUrl && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" size="sm" className="p-0 h-auto">
                        <Ruler className="h-4 w-4 mr-1" />
                        Ver guía de talles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Guía de Talles - {product.brand}</DialogTitle>
                        <DialogDescription>
                          Consulta la tabla de medidas para encontrar tu talle perfecto
                        </DialogDescription>
                      </DialogHeader>
                      <div className="relative w-full aspect-video">
                        <Image
                          src={sizeGuideUrl || "/placeholder.svg"}
                          alt="Guía de talles"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
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
            <label className="text-sm font-medium uppercase tracking-wide">Cantidad</label>
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

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto text-sm">
                Ver condiciones de envío completas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Condiciones de Envío</DialogTitle>
                <DialogDescription>Información detallada sobre nuestros envíos</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Tiempos de entrega</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>CABA y GBA: 2-4 días hábiles</li>
                    <li>Interior del país: 5-7 días hábiles</li>
                    <li>Zonas remotas: 7-10 días hábiles</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Costos de envío</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Envío gratis en compras superiores a $50.000</li>
                    <li>CABA y GBA: $2.500</li>
                    <li>Interior del país: $3.500</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Seguimiento</h4>
                  <p className="text-muted-foreground">
                    Recibirás un código de seguimiento por email una vez que tu pedido sea despachado.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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

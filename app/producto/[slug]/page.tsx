"use client"

import { useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingCart, Heart, Share2, ArrowLeft, Ruler, Truck, Package } from "lucide-react"
import type { Product } from "@/lib/database"
import { useCart } from "@/contexts/cart-context"
import { loadSimilarProducts } from "@/lib/loadSimilarProducts"
import { ProductCard } from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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
  const [imagesByColor, setImagesByColor] = useState<{ [key: string]: any[] }>({})
  const [currentImages, setCurrentImages] = useState<any[]>([])
  const [sizeGuideUrl, setSizeGuideUrl] = useState<string | null>(null)
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.slug}`)
        if (response.ok) {
          const data = await response.json()

          console.log("[v0] Product data loaded:", {
            name: data.name,
            imagesCount: data.images?.length || 0,
            images: data.images,
          })

          setProduct(data)

          if (data.allImagesByColor) {
            setImagesByColor(data.allImagesByColor)
            console.log("[v0] Images by color loaded:", Object.keys(data.allImagesByColor).length, "colors")
          }

          if (data.images && data.images.length > 0) {
            setCurrentImages(data.images)
            console.log("[v0] Initial images set:", data.images.length)
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
              console.log("[v0] Size guide loaded:", sizeGuideData.image_url)
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
    if (selectedColor && imagesByColor[selectedColor]) {
      console.log(
        "[v0] 🎨 Changing to color-specific images:",
        selectedColor,
        imagesByColor[selectedColor].length,
        "images",
      )
      setCurrentImages(imagesByColor[selectedColor])
      setSelectedImage(0)
    } else if (product?.images && product.images.length > 0) {
      console.log("[v0] 📷 Using default product images:", product.images.length)
      setCurrentImages(product.images)
      setSelectedImage(0)
    }
  }, [selectedColor, imagesByColor, product])

  useEffect(() => {
    if (availableVariants.length > 0) {
      const matchingVariant = availableVariants.find(
        (v) => (!selectedColor || v.color === selectedColor) && (!selectedSize || v.size === selectedSize),
      )
      if (matchingVariant) {
        setSelectedVariant(matchingVariant)
      }
    }
  }, [selectedColor, selectedSize, availableVariants])

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
      if (selectedVariant.sale_price && selectedVariant.sale_price < selectedVariant.price) {
        return selectedVariant.sale_price
      }
      return selectedVariant.price
    }
    if (product?.sale_price && product.sale_price < product.price) {
      return product.sale_price
    }
    return product?.price || 0
  }

  const getOriginalPrice = () => {
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
      const primaryImage = currentImages.find((img) => img.is_primary) || currentImages[0]
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-muted-foreground">Cargando producto...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return notFound()
  }

  const hasDiscount = product.sale_price && product.sale_price < product.price && product.discount_percentage > 0

  console.log("[v0] 🖼️ Rendering product with images:", {
    totalImages: currentImages.length,
    selectedImage,
    currentImageUrl: currentImages[selectedImage]?.image_url,
    availableColors: Object.keys(imagesByColor),
    selectedColor,
  })

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
            {currentImages.length > 0 && currentImages[selectedImage] ? (
              <Image
                key={`product-image-${selectedImage}-${currentImages[selectedImage].id}`}
                src={currentImages[selectedImage].image_url || "/placeholder.svg"}
                alt={currentImages[selectedImage].alt_text || product.name}
                fill
                className="object-cover"
                priority
                unoptimized
                onError={(e) => {
                  console.error("[v0] ❌ Error loading image:", {
                    url: currentImages[selectedImage].image_url,
                    index: selectedImage,
                  })
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=600&width=600"
                }}
                onLoad={() => {
                  console.log("[v0] ✅ Image loaded successfully:", {
                    url: currentImages[selectedImage].image_url,
                    index: selectedImage,
                  })
                }}
              />
            ) : (
              <Image
                src="/placeholder.svg?height=600&width=600"
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
          {currentImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {currentImages.map((image, index) => (
                <button
                  key={`thumbnail-${index}-${image.id}`}
                  onClick={() => {
                    console.log("[v0] Thumbnail clicked, changing to index:", index, "URL:", image.image_url)
                    setSelectedImage(index)
                  }}
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
            {hasDiscount && <span className="text-xl text-muted-foreground line-through">${getOriginalPrice()}</span>}
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

            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              {sizeGuideUrl && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left hover:text-primary transition-colors">
                    <span className="font-medium text-muted-foreground">Guía de talles</span>
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-background">
                      <Image
                        src={sizeGuideUrl || "/placeholder.svg"}
                        alt={`Guía de talles - ${product.brand}`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left hover:text-primary transition-colors">
                  <span className="font-medium text-muted-foreground">Condiciones de envío</span>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 text-muted-foreground space-y-1">
                  <p>• CABA y GBA: 2-4 días hábiles</p>
                  <p>• Interior del país: 5-7 días hábiles</p>
                  <p>• Envío gratis en compras superiores a $50.000</p>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left hover:text-primary transition-colors">
                  <span className="font-medium text-muted-foreground">Condiciones de cambio</span>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 text-muted-foreground space-y-1">
                  <p>• Cambios sin cargo dentro de los 30 días</p>
                  <p>• El producto debe estar sin uso y con etiquetas</p>
                  <p>• Presentar comprobante de compra</p>
                  <p>• No se aceptan cambios en productos en oferta</p>
                </CollapsibleContent>
              </Collapsible>
            </div>

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

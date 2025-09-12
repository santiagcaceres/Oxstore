"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ShoppingCart, Heart, Share2, Minus, Plus } from "lucide-react"
import type { Product } from "@/lib/database"
import { useCart } from "@/contexts/cart-context"
import { ProductCard } from "@/components/product-card"
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
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`)
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Product data received:", data)
          console.log("[v0] Variants in product data:", data.variants)

          setProduct(data)
          if (data.variants && data.variants.length > 0) {
            setAvailableVariants(data.variants)
            console.log("[v0] Available variants set:", data.variants)
          }
          if (data.color) setSelectedColor(data.color)
          if (data.size) setSelectedSize(data.size)

          loadSimilarProducts(data, setSimilarProducts, setLoadingSimilar)
        } else {
          notFound()
        }
      } catch (error) {
        console.error("Error loading product:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.slug])

  const getAvailableColors = () => {
    const colors = availableVariants
      .map((v) => v.color)
      .filter((color, index, arr) => color && arr.indexOf(color) === index)
    console.log("[v0] Available colors:", colors)
    return colors
  }

  const getAvailableSizes = () => {
    const sizes = availableVariants.map((v) => v.size).filter((size, index, arr) => size && arr.indexOf(size) === index)
    console.log("[v0] Available sizes:", sizes)
    return sizes
  }

  const increaseQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleAddToCart = async () => {
    if (product && product.stock_quantity > 0) {
      setIsAddingToCart(true)

      addItem({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.image_url || "/placeholder.svg",
        slug: params.slug,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
      })

      setTimeout(() => {
        setIsAddingToCart(false)
      }, 1000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/productos">Productos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.images?.[selectedImage]?.image_url || "/placeholder.svg?height=600&width=600"}
                alt={product.images?.[selectedImage]?.alt_text || product.name}
                fill
                className="object-cover"
                priority
              />

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.compare_price && product.compare_price > product.price && product.compare_price > 0 && (
                  <Badge variant="destructive">
                    -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                  </Badge>
                )}
                {product.is_featured && <Badge variant="secondary">Destacado</Badge>}
              </div>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 aspect-square w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={image.alt_text || product.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">{product.brand}</p>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold">${product.price}</span>
                {product.compare_price && product.compare_price > product.price && product.compare_price > 0 && (
                  <span className="text-xl text-muted-foreground line-through">${product.compare_price}</span>
                )}
              </div>

              <div className="mb-6">
                {product.stock_quantity > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-600">
                      {product.stock_quantity > 10 ? "En stock" : `Solo ${product.stock_quantity} disponibles`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm text-red-600">Agotado</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {availableVariants.length > 0 && getAvailableColors().length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium uppercase">Color:</label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="SELECCIONA UN COLOR" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableColors().map((color) => (
                        <SelectItem key={color} value={color}>
                          {color.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {availableVariants.length > 0 && getAvailableSizes().length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium uppercase">Talle:</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="SELECCIONA UN TALLE" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSizes().map((size) => (
                        <SelectItem key={size} value={size}>
                          {size.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Cantidad:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock_quantity}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className={`flex-1 transition-all duration-300 ${isAddingToCart ? "bg-green-500 hover:bg-green-600" : ""}`}
                  disabled={product.stock_quantity === 0 || isAddingToCart}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart
                    className={`h-5 w-5 mr-2 transition-transform duration-300 ${isAddingToCart ? "scale-110" : ""}`}
                  />
                  {isAddingToCart ? "¡Agregado!" : product.stock_quantity === 0 ? "Agotado" : "Agregar al Carrito"}
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <div className="prose prose-sm max-w-none">
                  <p>{product.description}</p>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">SKU:</span>
                    <span>{product.sku}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Marca:</span>
                    <span>{product.brand}</span>
                  </div>
                  {product.color && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Color:</span>
                      <span>{product.color}</span>
                    </div>
                  )}
                  {product.size && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Talle:</span>
                      <span>{product.size}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Peso:</span>
                      <span>{product.weight}g</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Dimensiones:</span>
                      <span>{product.dimensions}</span>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Productos que te pueden gustar</h2>
              <p className="text-muted-foreground">Descubre otros productos similares que podrían interesarte</p>
            </div>

            {loadingSimilar ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((similarProduct) => (
                  <ProductCard key={similarProduct.id} product={similarProduct} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

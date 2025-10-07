"use client"

import { useState, useEffect, useRef } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/database"

interface ProductGridProps {
  category?: string
  subcategory?: string
  gender?: string
  featured?: boolean
  search?: string
  initialProducts?: Product[]
  className?: string
  limit?: number
  sortBy?: string
  filterBrand?: string
  filterColor?: string
  filterSize?: string
  isNew?: boolean
  onSale?: boolean
  showCarousel?: boolean // Nueva prop para mostrar carrusel en mobile
}

export function ProductGrid({
  category,
  subcategory,
  gender,
  featured,
  search,
  initialProducts = [],
  className = "",
  limit = 12,
  sortBy = "created_at-desc",
  filterBrand = "",
  filterColor = "",
  filterSize = "",
  isNew = false,
  onSale = false,
  showCarousel = false, // Valor por defecto false
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0) // Estado para el carrusel
  const carouselRef = useRef<HTMLDivElement>(null) // Ref para el carrusel

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.scrollWidth / products.length
      carouselRef.current.scrollTo({
        left: cardWidth * index,
        behavior: "smooth",
      })
      setCurrentIndex(index)
    }
  }

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : products.length - 1
    scrollToIndex(newIndex)
  }

  const goToNext = () => {
    const newIndex = currentIndex < products.length - 1 ? currentIndex + 1 : 0
    scrollToIndex(newIndex)
  }

  useEffect(() => {
    if (showCarousel && products.length > 1) {
      const interval = setInterval(() => {
        goToNext()
      }, 4000) // Cambiar cada 4 segundos

      return () => clearInterval(interval)
    }
  }, [showCarousel, products.length, currentIndex])

  const loadProducts = async (reset = false) => {
    setLoading(true)
    try {
      console.log("[v0] Loading products with params:", {
        category,
        subcategory,
        gender,
        featured,
        search,
        reset,
        offset,
        sortBy,
        filterBrand,
        filterColor,
        filterSize,
        isNew,
        onSale,
      })

      const supabase = createClient()
      let query = supabase.from("products_in_stock").select("*").gt("stock_quantity", 0).eq("is_active", true)

      query = query.not("category", "is", null).not("brand", "is", null)

      if (category) {
        query = query.eq("category", category)
      }

      if (subcategory) {
        query = query.eq("subcategory", subcategory)
      }

      // Apply featured filter
      if (featured) {
        query = query.eq("is_featured", true)
      }

      if (isNew) {
        const twentyDaysAgo = new Date()
        twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20)
        query = query.gte("created_at", twentyDaysAgo.toISOString())
      }

      if (onSale) {
        query = query.not("sale_price", "is", null).gt("discount_percentage", 0)
      }

      if (filterBrand && filterBrand !== "all-brands") {
        query = query.eq("brand", filterBrand)
      }

      if (filterColor && filterColor !== "all-colors") {
        query = query.eq("color", filterColor)
      }

      if (filterSize && filterSize !== "all-sizes") {
        // Primero obtener todos los zureo_codes que tienen el talle buscado
        const { data: codesWithSize } = await supabase
          .from("products_in_stock")
          .select("zureo_code")
          .eq("size", filterSize)
          .gt("stock_quantity", 0)

        if (codesWithSize && codesWithSize.length > 0) {
          const codes = codesWithSize.map((item) => item.zureo_code)
          query = query.in("zureo_code", codes)
        } else {
          // Si no hay productos con ese talle, devolver array vacío
          setProducts([])
          setHasMore(false)
          setLoading(false)
          return
        }
      }

      // Apply search filter
      if (search) {
        const searchTerm = search.toLowerCase()
        query = query.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,zureo_code.ilike.%${searchTerm}%`,
        )
      }

      switch (sortBy) {
        case "price-asc":
          query = query.order("price", { ascending: true })
          break
        case "price-desc":
          query = query.order("price", { ascending: false })
          break
        case "name-asc":
          query = query.order("name", { ascending: true })
          break
        case "name-desc":
          query = query.order("name", { ascending: false })
          break
        default:
          query = query.order("created_at", { ascending: false })
      }

      const currentOffset = reset ? 0 : offset
      const { data: productsData, error } = await query.range(currentOffset, currentOffset + limit - 1)

      if (error) {
        console.error("[v0] Error loading products:", error)
        setProducts([])
        setHasMore(false)
        return
      }

      console.log("[v0] Loaded products from database:", productsData?.length || 0)

      const convertedProducts: Product[] = []
      const processedCodes = new Set()

      for (const p of productsData || []) {
        if (processedCodes.has(p.zureo_code)) continue
        processedCodes.add(p.zureo_code)

        const { data: variants } = await supabase
          .from("products_in_stock")
          .select("id, color, size, stock_quantity, price")
          .eq("zureo_code", p.zureo_code)
          .gt("stock_quantity", 0)
          .order("size")

        const product: Product & { variants?: any[] } = {
          id: p.id,
          name: p.name,
          slug: `${p.id}-${p.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim()}`,
          description: p.description,
          short_description: p.description?.substring(0, 100) + "...",
          price: p.price,
          compare_price: p.price * 1.2,
          sku: p.zureo_code,
          stock_quantity: p.stock_quantity,
          category_id: 1,
          brand: p.brand,
          is_active: p.is_active,
          is_featured: p.is_featured,
          created_at: p.created_at,
          updated_at: p.updated_at,
          size: p.size,
          variants: variants || [],
          images: [
            {
              id: p.id,
              product_id: p.id,
              image_url: p.image_url || "/placeholder.svg?height=400&width=400",
              alt_text: p.name,
              sort_order: 0,
              is_primary: true,
              created_at: p.created_at,
            },
          ],
        }

        convertedProducts.push(product)
      }

      if (reset) {
        setProducts(convertedProducts)
        setOffset(convertedProducts.length)
      } else {
        setProducts((prev) => [...prev, ...convertedProducts])
        setOffset((prev) => prev + convertedProducts.length)
      }

      setHasMore(convertedProducts.length === limit)
      console.log(
        "[v0] Products state updated:",
        convertedProducts.length,
        "total:",
        reset ? convertedProducts.length : products.length + convertedProducts.length,
      )
    } catch (error) {
      console.error("[v0] Error loading products:", error)
      setProducts([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("[v0] useEffect triggered with:", {
      category,
      subcategory,
      gender,
      featured,
      search,
      sortBy,
      filterBrand,
      filterColor,
      filterSize,
      isNew,
      onSale,
    })
    setOffset(0)
    loadProducts(true)
  }, [
    category,
    subcategory,
    gender,
    featured,
    search,
    limit,
    sortBy,
    filterBrand,
    filterColor,
    filterSize,
    isNew,
    onSale,
  ])

  const loadMore = () => {
    loadProducts(false)
  }

  if (products.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron productos.</p>
      </div>
    )
  }

  if (showCarousel) {
    return (
      <div className={className}>
        {/* Desktop Grid */}
        <div className="hidden md:block">
          <div
            className={`grid gap-6 ${
              limit === 5
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} className="animate-fade-in-up" />
            ))}
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-64 snap-start">
                <ProductCard product={product} className="animate-fade-in-up" />
              </div>
            ))}
          </div>

          {products.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: Math.min(8, limit) }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        className={`grid gap-6 ${
          limit === 5
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} className="animate-fade-in-up" />
        ))}

        {loading &&
          Array.from({ length: Math.min(8, limit) }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
      </div>

      {hasMore && !loading && products.length > 0 && limit > 5 && (
        <div className="text-center mt-8">
          <Button onClick={loadMore} variant="outline" size="lg">
            Cargar más productos
          </Button>
        </div>
      )}
    </div>
  )
}

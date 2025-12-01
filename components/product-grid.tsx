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
  currentPage?: number
  onTotalChange?: (total: number) => void
  random?: boolean
}

export function ProductGrid({
  category,
  subcategory,
  gender,
  featured,
  search,
  initialProducts = [],
  className = "",
  limit = 15,
  sortBy = "created_at-desc",
  filterBrand = "",
  filterColor = "",
  filterSize = "",
  isNew = false,
  onSale = false,
  showCarousel = false,
  currentPage = 1,
  onTotalChange,
  random = false,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

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

  const loadProducts = async () => {
    setLoading(true)
    try {
      console.log("[v0] Loading products with params:", {
        category,
        subcategory,
        gender,
        featured,
        search,
        currentPage, // Agregando currentPage al log
        sortBy,
        filterBrand,
        filterColor,
        filterSize,
        isNew,
        onSale,
        limit,
        random,
      })

      const offset = (currentPage - 1) * limit

      if (search && search.trim()) {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(search)}&limit=1000`)
        const data = await response.json()

        if (data.products) {
          const convertedProducts: Product[] = []
          const processedCodes = new Set<string>()

          for (const p of data.products) {
            if (processedCodes.has(p.zureo_code)) {
              continue
            }
            processedCodes.add(p.zureo_code)

            const supabase = createClient()

            const { data: variants } = await supabase
              .from("products_in_stock")
              .select("id, color, size, stock_quantity, price")
              .eq("zureo_code", p.zureo_code)
              .gt("stock_quantity", 0)
              .eq("is_active", true)
              .order("color")
              .order("size")

            const groupedVariants = new Map<string, any>()
            for (const variant of variants || []) {
              const key = `${variant.color}-${variant.size}`
              if (groupedVariants.has(key)) {
                const existing = groupedVariants.get(key)
                existing.stock_quantity += variant.stock_quantity
              } else {
                groupedVariants.set(key, { ...variant })
              }
            }

            const uniqueVariants = Array.from(groupedVariants.values())
            const variantIds = variants?.map((v) => v.id) || [p.id]

            const { data: productImages } = await supabase
              .from("product_images")
              .select("*")
              .in("product_id", variantIds)
              .order("sort_order")

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
              stock_quantity: uniqueVariants.reduce((sum, v) => sum + v.stock_quantity, 0),
              category_id: 1,
              brand: p.brand,
              is_active: true,
              is_featured: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              size: p.size,
              variants: uniqueVariants || [],
              images:
                productImages && productImages.length > 0
                  ? productImages
                  : [
                      {
                        id: p.id,
                        product_id: p.id,
                        image_url: "/placeholder.svg?height=400&width=400",
                        alt_text: p.name,
                        sort_order: 0,
                        is_primary: true,
                        created_at: new Date().toISOString(),
                      },
                    ],
            }

            convertedProducts.push(product)
          }

          const paginatedProducts = convertedProducts.slice(offset, offset + limit)
          setProducts(paginatedProducts)

          if (onTotalChange) {
            onTotalChange(convertedProducts.length)
          }

          setLoading(false)
          return
        }
      }

      const supabase = createClient()

      let countQuery = supabase
        .from("products_in_stock")
        .select("zureo_code", { count: "exact", head: false })
        .gt("stock_quantity", 0)
        .eq("is_active", true)
        .not("category", "is", null)
        .not("brand", "is", null)

      if (category) {
        countQuery = countQuery.eq("category", category)
      }

      if (subcategory) {
        countQuery = countQuery.eq("subcategory", subcategory)
      }

      if (gender && gender !== "unisex") {
        countQuery = countQuery.or(`gender.eq.${gender},gender.eq.unisex`)
      } else if (gender === "unisex") {
        countQuery = countQuery.eq("gender", "unisex")
      }

      if (featured) {
        countQuery = countQuery.eq("is_featured", true)
      }

      if (isNew) {
        const twentyDaysAgo = new Date()
        twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20)
        countQuery = countQuery.gte("created_at", twentyDaysAgo.toISOString())
      }

      if (onSale) {
        countQuery = countQuery.not("sale_price", "is", null).gt("discount_percentage", 0)
      }

      if (filterBrand && filterBrand !== "all-brands") {
        countQuery = countQuery.eq("brand", filterBrand)
      }

      if (filterColor && filterColor !== "all-colors") {
        countQuery = countQuery.eq("color", filterColor)
      }

      if (filterSize && filterSize !== "all-sizes") {
        const { data: codesWithSize } = await supabase
          .from("products_in_stock")
          .select("zureo_code")
          .eq("size", filterSize)
          .gt("stock_quantity", 0)

        if (codesWithSize && codesWithSize.length > 0) {
          const codes = codesWithSize.map((item) => item.zureo_code)
          countQuery = countQuery.in("zureo_code", codes)
        } else {
          setProducts([])
          if (onTotalChange) {
            onTotalChange(0)
          }
          setLoading(false)
          return
        }
      }

      const { data: countData } = await countQuery

      const uniqueCodes = new Set(countData?.map((item) => item.zureo_code))
      const totalCount = uniqueCodes.size

      console.log("[v0] Total unique products:", totalCount)

      if (onTotalChange) {
        onTotalChange(totalCount)
      }

      let query = supabase
        .from("products_in_stock")
        .select("*")
        .gt("stock_quantity", 0)
        .eq("is_active", true)
        .not("category", "is", null)
        .not("brand", "is", null)

      if (category) {
        query = query.eq("category", category)
      }

      if (subcategory) {
        query = query.eq("subcategory", subcategory)
      }

      if (gender && gender !== "unisex") {
        query = query.or(`gender.eq.${gender},gender.eq.unisex`)
      } else if (gender === "unisex") {
        query = query.eq("gender", "unisex")
      }

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
        const { data: codesWithSize } = await supabase
          .from("products_in_stock")
          .select("zureo_code")
          .eq("size", filterSize)
          .gt("stock_quantity", 0)

        if (codesWithSize && codesWithSize.length > 0) {
          const codes = codesWithSize.map((item) => item.zureo_code)
          query = query.in("zureo_code", codes)
        }
      }

      if (random) {
        const supabase = createClient()

        // Get all product IDs that have real images
        const { data: productsWithImages } = await supabase
          .from("product_images")
          .select("product_id")
          .neq("image_url", "/placeholder.svg?height=400&width=400")
          .not("image_url", "like", "%placeholder.svg%")

        if (productsWithImages && productsWithImages.length > 0) {
          const productIdsWithImages = productsWithImages.map((item) => item.product_id)

          // Get zureo_codes for products that have images
          const { data: productsData } = await supabase
            .from("products_in_stock")
            .select("zureo_code")
            .in("id", productIdsWithImages)
            .gt("stock_quantity", 0)
            .eq("is_active", true)
            .not("category", "is", null)
            .not("brand", "is", null)

          if (productsData && productsData.length > 0) {
            const uniqueCodes = Array.from(new Set(productsData.map((item) => item.zureo_code)))
            const shuffledCodes = uniqueCodes.sort(() => Math.random() - 0.5)
            const selectedCodes = shuffledCodes.slice(0, limit)

            query = query.in("zureo_code", selectedCodes)
          } else {
            // No products with images found, return empty
            setProducts([])
            setLoading(false)
            return
          }
        } else {
          // No images found, return empty
          setProducts([])
          setLoading(false)
          return
        }
      } else {
        // Ordenamiento normal
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
      }

      const { data: productsData, error } = await query

      if (error) {
        console.error("[v0] Error loading products:", error)
        setProducts([])
        return
      }

      console.log("[v0] Loaded products from database:", productsData?.length || 0)

      const convertedProducts: Product[] = []
      const processedCodes = new Set<string>()

      for (const p of productsData || []) {
        if (processedCodes.has(p.zureo_code)) {
          continue
        }
        processedCodes.add(p.zureo_code)

        const { data: variants } = await supabase
          .from("products_in_stock")
          .select("id, color, size, stock_quantity, price")
          .eq("zureo_code", p.zureo_code)
          .gt("stock_quantity", 0)
          .eq("is_active", true)
          .order("color")
          .order("size")

        const groupedVariants = new Map<string, any>()
        for (const variant of variants || []) {
          const key = `${variant.color}-${variant.size}`
          if (groupedVariants.has(key)) {
            const existing = groupedVariants.get(key)
            existing.stock_quantity += variant.stock_quantity
          } else {
            groupedVariants.set(key, { ...variant })
          }
        }

        const uniqueVariants = Array.from(groupedVariants.values())
        const variantIds = variants?.map((v) => v.id) || [p.id]

        const { data: productImages } = await supabase
          .from("product_images")
          .select("*")
          .in("product_id", variantIds)
          .order("sort_order")

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
          variants: uniqueVariants || [],
          images:
            productImages && productImages.length > 0
              ? productImages
              : [
                  {
                    id: p.id,
                    product_id: p.id,
                    image_url: "/placeholder.svg?height=400&width=400",
                    alt_text: p.name,
                    sort_order: 0,
                    is_primary: true,
                    created_at: p.created_at,
                  },
                ],
        }

        convertedProducts.push(product)
      }

      setProducts(convertedProducts)
      console.log("[v0] Products state updated:", convertedProducts.length)
    } catch (error) {
      console.error("[v0] Error loading products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("[v0] useEffect triggered - loading products for page:", currentPage)
    loadProducts()
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
    currentPage,
    random,
  ])

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
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory">
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-64 snap-start">
                <ProductCard product={product} className="animate-fade-in-up" />
              </div>
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
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory">
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
    </div>
  )
}

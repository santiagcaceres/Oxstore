"use client"

import { useState, useEffect } from "react"
import ProductSlider from "@/components/product-slider"
import BannerCarousel from "@/components/banner-carousel"
import BannerGrid from "@/components/banner-grid"
import BrandsMarquee from "@/components/brands-marquee"
import { getBannersByType } from "@/lib/supabase"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  title: string
  price: number
  images: string[]
  handle: string
  brand: string
}

interface Banner {
  id: string
  title: string
  description: string
  image_url: string
  link_url: string
  banner_type: string
  banner_size: string
  display_order: number
  is_active: boolean
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [heroBanners, setHeroBanners] = useState<Banner[]>([])
  const [categoryBanners, setCategoryBanners] = useState<Banner[]>([])
  const [promotionalBanners, setPromotionalBanners] = useState<Banner[]>([])
  const [productBanners, setProductBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadProducts()
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      const [hero, category, promotional, product] = await Promise.all([
        getBannersByType("hero"),
        getBannersByType("category"),
        getBannersByType("promotional"),
        getBannersByType("product"),
      ])

      setHeroBanners(hero)
      setCategoryBanners(category)
      setPromotionalBanners(promotional)
      setProductBanners(product)
    } catch (error) {
      console.error("Error loading banners:", error)
    }
  }

  const loadProducts = async () => {
    try {
      const { data: customProducts, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            image_url,
            is_primary
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (customProducts && customProducts.length > 0) {
        // Obtener datos de stock desde Zureo para estos productos
        const response = await fetch("/api/zureo/products-with-stock")
        const stockData = await response.json()

        if (stockData.success) {
          const productsWithStock = customProducts
            .map((product: any) => {
              const stockInfo = stockData.products.find((p: any) => p.codigo === product.product_code)
              if (!stockInfo || stockInfo.stock <= 0) return null

              return {
                id: product.product_code,
                title: product.custom_title || stockInfo.nombre,
                price: stockInfo.precio,
                images: product.product_images
                  ?.filter((img: any) => img.image_url)
                  .map((img: any) => img.image_url) || ["/placeholder.svg"],
                handle: product.product_code,
                brand: stockInfo.marca || "Sin marca",
              }
            })
            .filter(Boolean)

          // Dividir productos en categorías
          const featured = productsWithStock
            .filter((p: any) => customProducts.find((cp: any) => cp.product_code === p.id)?.is_featured)
            .slice(0, 8)

          const remaining = productsWithStock.filter(
            (p: any) => !customProducts.find((cp: any) => cp.product_code === p.id)?.is_featured,
          )

          setFeaturedProducts(featured.length > 0 ? featured : remaining.slice(0, 8))
          setNewProducts(remaining.slice(0, 8))
          setSaleProducts(remaining.slice(-8).reverse())
        }
      } else {
        // Fallback: usar productos de Zureo directamente si no hay productos personalizados
        const response = await fetch("/api/zureo/products-with-stock")
        const data = await response.json()

        if (data.success) {
          const products = data.products
            .filter((product: any) => product.stock > 0)
            .map((product: any) => ({
              id: product.codigo,
              title: product.nombre,
              price: product.precio,
              images: [product.imagen || "/placeholder.svg"],
              handle: product.codigo,
              brand: product.marca || "Sin marca",
            }))

          setFeaturedProducts(products.slice(0, 8))
          setNewProducts(products.slice(8, 16))
          setSaleProducts(products.slice(-8).reverse())
        }
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Banner Principal - Carousel */}
      {heroBanners.length > 0 && <BannerCarousel banners={heroBanners} />}

      <BrandsMarquee />

      {/* Banners de Categorías */}
      {categoryBanners.length > 0 && (
        <section className="py-8 bg-white">
          <BannerGrid banners={categoryBanners} type="category" />
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Productos Destacados</h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
            </div>
          ) : (
            <ProductSlider products={featuredProducts} />
          )}
        </div>
      </section>

      {promotionalBanners.length > 0 && (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <BannerGrid banners={promotionalBanners} type="promotional" />
          </div>
        </section>
      )}

      {/* New Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Nuevos Productos</h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
            </div>
          ) : (
            <ProductSlider products={newProducts} />
          )}
        </div>
      </section>

      {/* Banners de Productos */}
      {productBanners.length > 0 && (
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <BannerGrid banners={productBanners} type="product" />
          </div>
        </section>
      )}

      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Ofertas Especiales</h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <ProductSlider products={saleProducts} />
          )}
        </div>
      </section>

      {productBanners.slice(-1).map((banner) => (
        <section key={banner.id} className="py-4">
          <div className="container mx-auto px-4">
            <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-lg">
              <img
                src={banner.image_url || "/placeholder.svg"}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              {(banner.title || banner.description || banner.link_url) && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    {banner.title && <h3 className="text-2xl md:text-3xl font-bold mb-2">{banner.title}</h3>}
                    {banner.description && <p className="text-lg mb-4">{banner.description}</p>}
                    {banner.link_url && (
                      <a
                        href={banner.link_url}
                        className="inline-block bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Ver Más
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

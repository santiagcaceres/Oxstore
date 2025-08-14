"use client"

import { useState, useEffect } from "react"
import BrandCarousel from "@/components/brand-carousel"
import ProductSlider from "@/components/product-slider"
import BannerCarousel from "@/components/banner-carousel"
import BannerGrid from "@/components/banner-grid"
import { getAllZureoProducts } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"
import { getBannersByType } from "@/lib/supabase"

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
      const zureoProducts = await getAllZureoProducts()

      // Solo productos con marca, imagen y precio
      const completeProducts = zureoProducts
        .filter((product: any) => product.marca?.nombre && product.precio > 0 && !product.baja)
        .map((product: any) => {
          const transformed = transformZureoProduct(product)
          return {
            ...transformed,
            brand: product.marca.nombre,
          }
        })
        .filter((product: Product) => product.images.length > 0)

      // Productos destacados (primeros 8)
      setFeaturedProducts(completeProducts.slice(0, 8))

      // Productos nuevos (siguientes 8)
      setNewProducts(completeProducts.slice(8, 16))

      setSaleProducts(completeProducts.slice(-8).reverse())
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

      {/* Brand Carousel */}
      <BrandCarousel />

      {/* Banners de Categorías */}
      {categoryBanners.length > 0 && (
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <BannerGrid banners={categoryBanners} type="category" />
          </div>
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

      {/* Banners Promocionales */}
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

      {/* Banner sobre el footer */}
      {productBanners.slice(-1).map((banner) => (
        <section key={banner.id} className="w-full">
          <div className="relative h-48 md:h-64 w-full overflow-hidden">
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
        </section>
      ))}
    </div>
  )
}

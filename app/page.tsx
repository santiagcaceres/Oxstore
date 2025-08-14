"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import BrandCarousel from "@/components/brand-carousel"
import ProductSlider from "@/components/product-slider"
import { getAllZureoProducts } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"
import { supabase } from "@/lib/supabase/client"

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
  display_order: number
  is_active: boolean
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      if (!supabase) return

      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      if (error) throw error
      setBanners(data || [])
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

  const BannerSection = ({ banner }: { banner: Banner }) => (
    <section className="w-full">
      <div className="relative h-64 md:h-96 w-full overflow-hidden">
        <Image src={banner.image_url || "/placeholder.svg"} alt={banner.title} fill className="object-cover" priority />
        {(banner.title || banner.description || banner.link_url) && (
          <div className="absolute inset-0 bg-black/30 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl">
                {banner.title && <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{banner.title}</h2>}
                {banner.description && <p className="text-lg md:text-xl text-gray-200 mb-6">{banner.description}</p>}
                {banner.link_url && (
                  <Link
                    href={banner.link_url}
                    className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Ver Más
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )

  return (
    <div className="min-h-screen">
      {banners.slice(0, 2).map((banner) => (
        <BannerSection key={banner.id} banner={banner} />
      ))}

      {/* Brand Carousel */}
      <BrandCarousel />

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

      {banners.slice(2, 4).map((banner) => (
        <BannerSection key={banner.id} banner={banner} />
      ))}

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

      {banners.slice(-1).map((banner) => (
        <BannerSection key={banner.id} banner={banner} />
      ))}
    </div>
  )
}

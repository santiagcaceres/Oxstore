"use client"

import { useState, useEffect } from "react"
import HeroSlider from "@/components/hero-slider"
import BrandCarousel from "@/components/brand-carousel"
import ProductSlider from "@/components/product-slider"
import { getAllZureoProducts } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"

interface Product {
  id: string
  title: string
  price: number
  images: string[]
  handle: string
  brand: string
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

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
      {/* Hero Slider */}
      <HeroSlider />

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

      <section className="py-8 bg-black">
        <div className="container mx-auto px-4">
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10" />
            <div className="absolute inset-0 bg-gray-800" />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-8">
                <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">Nueva Colección</h3>
                <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-md">
                  Descubre las últimas tendencias en moda urbana
                </p>
                <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Ver Colección
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative h-48 md:h-64 rounded-lg overflow-hidden bg-gradient-to-r from-gray-900 to-gray-700">
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">Envío Gratis</h3>
                <p className="text-lg text-gray-200 mb-4">En compras superiores a $2000 UYU</p>
                <div className="text-sm text-gray-300">Válido para todo Uruguay</div>
              </div>
            </div>
          </div>
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
    </div>
  )
}

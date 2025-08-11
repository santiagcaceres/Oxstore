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

      // Productos nuevos (últimos 8)
      setNewProducts(completeProducts.slice(-8).reverse())
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
    </div>
  )
}

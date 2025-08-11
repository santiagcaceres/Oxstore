"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getBrandImages } from "@/lib/supabase"

interface BrandImage {
  id: string
  brand_id: string
  image_url: string
  updated_at: string
}

export default function BrandCarousel() {
  const [brandImages, setBrandImages] = useState<BrandImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBrandImages()
  }, [])

  const loadBrandImages = async () => {
    try {
      const images = await getBrandImages()
      setBrandImages(images)
    } catch (error) {
      console.error("Error loading brand images:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || brandImages.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8 text-black">Nuestras Marcas</h2>

        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            {/* Primera vuelta */}
            {brandImages.map((brand, index) => (
              <div
                key={`first-${brand.id}-${index}`}
                className="flex-shrink-0 w-32 h-20 mx-4 bg-white rounded-lg shadow-sm border flex items-center justify-center hover:shadow-md transition-shadow"
              >
                <div className="relative w-24 h-16">
                  <Image
                    src={brand.image_url || "/placeholder.svg"}
                    alt="Marca"
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </div>
            ))}

            {/* Segunda vuelta para animación infinita */}
            {brandImages.map((brand, index) => (
              <div
                key={`second-${brand.id}-${index}`}
                className="flex-shrink-0 w-32 h-20 mx-4 bg-white rounded-lg shadow-sm border flex items-center justify-center hover:shadow-md transition-shadow"
              >
                <div className="relative w-24 h-16">
                  <Image
                    src={brand.image_url || "/placeholder.svg"}
                    alt="Marca"
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

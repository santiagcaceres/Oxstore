"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

interface Banner {
  id: string
  title: string
  description?: string
  image_url: string
  link_url?: string
  banner_type: string
  banner_size: string
  display_order: number
}

interface BannerCarouselProps {
  banners: Banner[]
  autoSlide?: boolean
  slideInterval?: number
}

export default function BannerCarousel({ banners, autoSlide = true, slideInterval = 5000 }: BannerCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!autoSlide || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, slideInterval)

    return () => clearInterval(interval)
  }, [autoSlide, slideInterval, banners.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  if (banners.length === 0) return null

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
            {banner.link_url ? (
              <Link href={banner.link_url} className="block w-full h-full">
                <Image
                  src={banner.image_url || "/placeholder.svg"}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={currentSlide === banners.findIndex((b) => b.id === banner.id)}
                />
              </Link>
            ) : (
              <Image
                src={banner.image_url || "/placeholder.svg"}
                alt={banner.title}
                fill
                className="object-cover"
                priority={currentSlide === banners.findIndex((b) => b.id === banner.id)}
              />
            )}

            {/* Overlay con información */}
            {(banner.title || banner.description) && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-end">
                <div className="p-6 md:p-8 text-white">
                  {banner.title && <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>}
                  {banner.description && <p className="text-lg md:text-xl opacity-90">{banner.description}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controles de navegación */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide ? "bg-white" : "bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

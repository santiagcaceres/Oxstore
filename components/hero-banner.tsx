"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Banner } from "@/lib/database"

export function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await fetch("/api/banners?position=hero")
        const data = await response.json()
        const activeBanners = data.filter((banner: Banner) => {
          if (!banner.is_active) return false

          const now = new Date()
          const startDate = banner.start_date ? new Date(banner.start_date) : null
          const endDate = banner.end_date ? new Date(banner.end_date) : null

          if (startDate && now < startDate) return false
          if (endDate && now > endDate) return false

          return true
        })
        setBanners(activeBanners)
      } catch (error) {
        console.error("Error loading banners:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBanners()
  }, [])

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [banners.length])

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex((prev) => (prev + 1) % banners.length)
      setTimeout(() => setIsTransitioning(false), 700)
    }
  }

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
      setTimeout(() => setIsTransitioning(false), 700)
    }
  }

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentIndex) {
      setIsTransitioning(true)
      setCurrentIndex(index)
      setTimeout(() => setIsTransitioning(false), 700)
    }
  }

  if (loading || banners.length === 0) {
    return <div className="h-64 md:h-80 bg-muted skeleton" />
  }

  const currentBanner = banners[currentIndex]
  const imageUrl =
    currentBanner.mobile_image_url && typeof window !== "undefined" && window.innerWidth < 768
      ? currentBanner.mobile_image_url
      : currentBanner.image_url

  return (
    <div className="relative h-64 md:h-80 bg-gray-100 group">
      <div className="flex h-full">
        <div className="relative w-1/2 md:w-3/5">
          {banners.map((banner, index) => {
            const bannerImageUrl =
              banner.mobile_image_url && typeof window !== "undefined" && window.innerWidth < 768
                ? banner.mobile_image_url
                : banner.image_url

            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={bannerImageUrl || "/placeholder.svg?height=320&width=600&query=pareja+moderna+ropa+elegante"}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            )
          })}
        </div>

        <div className="w-1/2 md:w-2/5 flex items-center justify-center bg-white p-6 md:p-8">
          <div
            className={`text-center transition-all duration-700 ${
              isTransitioning ? "opacity-0 transform translate-y-8" : "opacity-100 transform translate-y-0"
            }`}
          >
            <h1 className="text-xl md:text-3xl font-bold mb-3 text-gray-900">{currentBanner.title}</h1>
            {currentBanner.subtitle && (
              <p className="text-sm md:text-base mb-4 text-gray-600">{currentBanner.subtitle}</p>
            )}
            {currentBanner.link_url && currentBanner.button_text && (
              <Button
                asChild
                size="lg"
                className="bg-black text-white hover:bg-gray-800 px-6 py-2 text-sm md:text-base"
              >
                <Link href={currentBanner.link_url}>{currentBanner.button_text}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={prevSlide}
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={nextSlide}
            disabled={isTransitioning}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-3 left-1/4 -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

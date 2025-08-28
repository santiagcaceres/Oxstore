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
    return <div className="aspect-square bg-muted skeleton rounded-lg" />
  }

  const currentBanner = banners[currentIndex]
  const imageUrl =
    currentBanner.mobile_image_url && typeof window !== "undefined" && window.innerWidth < 768
      ? currentBanner.mobile_image_url
      : currentBanner.image_url

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg group parallax">
      {/* Background Images with Crossfade Effect */}
      <div className="absolute inset-0">
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
                src={bannerImageUrl || "/placeholder.svg"}
                alt={banner.title}
                fill
                className="object-cover transition-transform duration-[10000ms] ease-out group-hover:scale-105"
                priority={index === 0}
              />
            </div>
          )
        })}
      </div>

      {/* Enhanced Overlay with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50" />

      {/* Content with Staggered Animations */}
      <div className="absolute inset-0 flex items-center justify-center text-center text-white p-8">
        <div
          className={`max-w-2xl transition-all duration-700 ${isTransitioning ? "opacity-0 transform translate-y-8" : "opacity-100 transform translate-y-0"}`}
        >
          <h1 className="text-2xl md:text-4xl font-bold mb-4 animate-fade-in-up stagger-1">{currentBanner.title}</h1>
          {currentBanner.subtitle && (
            <p className="text-base md:text-lg mb-6 text-white/90 animate-fade-in-up stagger-2">
              {currentBanner.subtitle}
            </p>
          )}
          {currentBanner.link_url && currentBanner.button_text && (
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:bg-white/90 hover-scale btn-press animate-fade-in-up stagger-3"
            >
              <Link href={currentBanner.link_url}>{currentBanner.button_text}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Navigation */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 hover-scale transform -translate-x-2 group-hover:translate-x-0"
            onClick={prevSlide}
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 hover-scale transform translate-x-2 group-hover:translate-x-0"
            onClick={nextSlide}
            disabled={isTransitioning}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Enhanced Dots with Animation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 hover-scale ${
                  index === currentIndex ? "bg-white scale-125 animate-pulse-glow" : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
              />
            ))}
          </div>
        </>
      )}

      {/* Progress Bar */}
      {banners.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-[5000ms] ease-linear"
            style={{
              width: `${((currentIndex + 1) / banners.length) * 100}%`,
              animation: "none",
            }}
          />
        </div>
      )}
    </div>
  )
}

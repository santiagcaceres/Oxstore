"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface Banner {
  id: number
  title: string
  subtitle?: string
  image_url?: string
  link_url?: string
  position: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const { data, error } = await supabase
          .from("banners")
          .select("*")
          .eq("position", "hero")
          .eq("is_active", true)
          .order("created_at", { ascending: true })

        if (error) {
          console.error("Error loading banners:", error)
        } else {
          setBanners(data || [])
        }
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
    return (
      <div className="w-full h-64 md:h-80 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center p-8">
          {loading ? (
            <div className="space-y-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-48 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-32 mx-auto"></div>
              </div>
              <p className="text-gray-500 text-sm">Cargando banners...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-700">No hay banners disponibles</h2>
              <p className="text-gray-500 text-sm">Configure banners desde el panel de administración</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative w-screen h-64 md:h-80 bg-gray-100 group -mx-4 md:-mx-6 lg:-mx-8">
      <Link href={currentBanner.link_url || "#"} className="block h-full">
        <div className="relative w-full h-full">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={banner.image_url || "/placeholder.svg?height=320&width=600&query=pareja+moderna+ropa+elegante"}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </Link>

      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            onClick={(e) => {
              e.preventDefault()
              prevSlide()
            }}
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            onClick={(e) => {
              e.preventDefault()
              nextSlide()
            }}
            disabled={isTransitioning}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  goToSlide(index)
                }}
                disabled={isTransitioning}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import type { Banner } from "@/lib/database"

interface CategoryBannersProps {
  position?: string
}

export function CategoryBanners({ position = "category" }: CategoryBannersProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await fetch(`/api/banners?position=${position}`)
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
        console.error("Error loading category banners:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBanners()
  }, [position])

  if (loading || banners.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-square bg-muted skeleton rounded-lg" />
        <div className="aspect-square bg-muted skeleton rounded-lg" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {banners.slice(0, 2).map((banner) => (
        <Link
          key={banner.id}
          href={banner.link_url || "#"}
          className="group relative aspect-square overflow-hidden rounded-lg hover-scale"
        >
          <Image
            src={banner.image_url || "/placeholder.svg"}
            alt={banner.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{banner.title}</h3>
            {banner.subtitle && <p className="text-white/90 text-sm">{banner.subtitle}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}

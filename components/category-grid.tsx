"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Category } from "@/lib/database"

interface CategoryGridProps {
  className?: string
}

export function CategoryGrid({ className = "" }: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error("Error loading categories:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${className}`}>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categoria/${category.slug}`}
          className="group relative aspect-square overflow-hidden rounded-lg hover-lift"
        >
          <Image
            src={category.image_url || "/placeholder.svg?height=300&width=300"}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 flex items-end p-4">
            <div className="text-white">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              {category.description && <p className="text-sm text-white/80 mt-1">{category.description}</p>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

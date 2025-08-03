"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type Brand = {
  id: number
  nombre: string
}

export default function BrandCarousel({ brands }: { brands: Brand[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 6

  if (!brands || brands.length === 0) {
    return <div className="text-center py-10">No hay marcas para mostrar.</div>
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1 >= brands.length - itemsPerView + 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, brands.length - itemsPerView) : prev - 1))
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex items-center transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {brands.map((brand) => (
            <div key={brand.id} className="w-1/6 flex-shrink-0 px-4">
              <Link href={`/marcas/${encodeURIComponent(brand.nombre)}`} className="group block">
                <div className="aspect-[3/2] flex items-center justify-center bg-gray-100 rounded-lg p-4 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-lg font-bold text-gray-700 text-center">{brand.nombre}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:bg-gray-50"
        onClick={prevSlide}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:bg-gray-50"
        onClick={nextSlide}
        disabled={currentIndex >= brands.length - itemsPerView}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}

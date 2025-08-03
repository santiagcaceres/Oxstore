"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { TransformedProduct } from "@/lib/data-transformer"

export default function ProductSlider({ products }: { products: TransformedProduct[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 4

  if (!products || products.length === 0) {
    return <div className="text-center py-10">No hay productos destacados para mostrar.</div>
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1 >= products.length - itemsPerView + 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, products.length - itemsPerView) : prev - 1))
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-2">
              <Link href={`/producto/${product.handle}`} className="group block">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="relative aspect-square">
                    <Image
                      src={product.images[0] || "/placeholder.svg?height=300&width=300&text=Producto"}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized={product.images[0]?.startsWith("data:image")}
                    />
                    {!product.inStock && (
                      <Badge variant="destructive" className="absolute top-3 right-3">
                        Agotado
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 truncate">{product.title}</h3>
                    <p className="text-blue-900 font-bold text-xl">${product.price}</p>
                  </div>
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
        disabled={currentIndex >= products.length - itemsPerView}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}

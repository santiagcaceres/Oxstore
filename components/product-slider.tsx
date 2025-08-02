"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const featuredProducts = [
  {
    id: 1,
    name: "Remera Premium",
    price: 35,
    image: "/placeholder.svg?height=300&width=300&text=Remera+Premium",
    isNew: true,
    handle: "remera-premium",
  },
  {
    id: 2,
    name: "Jean Clásico",
    price: 85,
    image: "/placeholder.svg?height=300&width=300&text=Jean+Clásico",
    isNew: false,
    handle: "jean-clasico",
  },
  {
    id: 3,
    name: "Buzo Oversize",
    price: 65,
    image: "/placeholder.svg?height=300&width=300&text=Buzo+Oversize",
    isNew: true,
    handle: "buzo-oversize",
  },
  {
    id: 4,
    name: "Zapatillas Sport",
    price: 120,
    image: "/placeholder.svg?height=300&width=300&text=Zapatillas+Sport",
    isNew: false,
    handle: "zapatillas-sport",
  },
  {
    id: 5,
    name: "Campera Denim",
    price: 95,
    image: "/placeholder.svg?height=300&width=300&text=Campera+Denim",
    isNew: true,
    handle: "campera-denim",
  },
]

export default function ProductSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 4

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + itemsPerView >= featuredProducts.length ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, featuredProducts.length - itemsPerView) : prev - 1))
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {featuredProducts.map((product) => (
            <div key={product.id} className="w-1/4 flex-shrink-0 px-2">
              <Link href={`/producto/${product.handle}`} className="group block">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.isNew && <Badge className="absolute top-3 right-3 bg-blue-900">Nuevo</Badge>}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-blue-900 font-bold text-xl">${product.price}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:bg-gray-50"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:bg-gray-50"
        onClick={nextSlide}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}

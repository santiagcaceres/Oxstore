"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Clock, FlameIcon as Fire } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const ofertasProducts = [
  {
    id: "2",
    title: "Jean Clásico",
    price: 85,
    compareAtPrice: 110,
    image: "/placeholder.svg?width=400&height=400&text=Jean+Oferta",
    rating: 4.6,
    reviewCount: 89,
    handle: "jean-clasico",
    timeLeft: "2 días",
    stock: 5,
  },
  {
    id: "3",
    title: "Buzo con Capucha",
    price: 65,
    compareAtPrice: 80,
    image: "/placeholder.svg?width=400&height=400&text=Buzo+Oferta",
    rating: 4.7,
    reviewCount: 156,
    handle: "buzo-con-capucha",
    timeLeft: "5 horas",
    stock: 12,
  },
  {
    id: "4",
    title: "Campera Bomber",
    price: 120,
    compareAtPrice: 150,
    image: "/placeholder.svg?width=400&height=400&text=Campera+Oferta",
    rating: 4.9,
    reviewCount: 78,
    handle: "campera-bomber",
    timeLeft: "1 día",
    stock: 3,
  },
  {
    id: "6",
    title: "Gorra Deportiva",
    price: 25,
    compareAtPrice: 35,
    image: "/placeholder.svg?width=400&height=400&text=Gorra+Oferta",
    rating: 4.5,
    reviewCount: 67,
    handle: "gorra-deportiva",
    timeLeft: "3 días",
    stock: 8,
  },
]

export default function OfertasPage() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Fire className="h-8 w-8" />
            <h1 className="text-4xl md:text-6xl font-bold">OFERTAS ESPECIALES</h1>
            <Fire className="h-8 w-8" />
          </div>
          <p className="text-xl md:text-2xl mb-8">Descuentos increíbles por tiempo limitado</p>

          {/* Contador regresivo */}
          <div className="bg-white text-red-600 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">Oferta termina en:</span>
            </div>
            <div className="flex justify-center gap-4 text-2xl font-bold">
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-lg p-2 min-w-[60px]">
                  {timeLeft.hours.toString().padStart(2, "0")}
                </div>
                <div className="text-sm mt-1">Horas</div>
              </div>
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-lg p-2 min-w-[60px]">
                  {timeLeft.minutes.toString().padStart(2, "0")}
                </div>
                <div className="text-sm mt-1">Min</div>
              </div>
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-lg p-2 min-w-[60px]">
                  {timeLeft.seconds.toString().padStart(2, "0")}
                </div>
                <div className="text-sm mt-1">Seg</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Productos en Oferta</h2>
          <p className="text-gray-600">Aprovecha estos descuentos antes de que se agoten</p>
        </div>

        {/* Grid de productos en oferta */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ofertasProducts.map((product) => {
            const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)

            return (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <Link href={`/producto/${product.handle}`}>
                      <div className="aspect-square bg-gray-100 overflow-hidden rounded-t-lg">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <Badge className="absolute top-2 left-2 bg-red-500">-{discount}%</Badge>
                    {product.stock <= 5 && (
                      <Badge className="absolute top-2 right-2 bg-orange-500">¡Últimas {product.stock}!</Badge>
                    )}
                  </div>

                  <div className="p-4">
                    <Link href={`/producto/${product.handle}`}>
                      <h3 className="font-medium text-gray-900 mb-2 hover:text-blue-950 transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">({product.reviewCount})</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-red-600">${product.price}</span>
                      <span className="text-sm text-gray-500 line-through">${product.compareAtPrice}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>Termina en {product.timeLeft}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Banner de urgencia */}
        <div className="mt-16 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¡Últimas horas de ofertas!</h2>
          <p className="text-xl mb-6">No dejes pasar estas oportunidades únicas</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-orange-600 hover:bg-gray-100">Ver todos los productos</Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-orange-600 bg-transparent"
            >
              Suscribirse a ofertas
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

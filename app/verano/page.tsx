"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Filter, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const veranoProducts = [
  {
    id: "1",
    title: "Remera Premium Algodón",
    price: 35,
    compareAtPrice: 45,
    image: "/placeholder.svg?width=400&height=400&text=Remera+Verano",
    rating: 4.8,
    reviewCount: 124,
    handle: "remera-premium-algodon",
    isNew: true,
  },
  {
    id: "5",
    title: "Vestido Elegante",
    price: 95,
    compareAtPrice: 120,
    image: "/placeholder.svg?width=400&height=400&text=Vestido+Verano",
    rating: 4.8,
    reviewCount: 92,
    handle: "vestido-elegante",
    isNew: false,
  },
  {
    id: "7",
    title: "Short Deportivo",
    price: 28,
    compareAtPrice: 35,
    image: "/placeholder.svg?width=400&height=400&text=Short+Verano",
    rating: 4.6,
    reviewCount: 156,
    handle: "short-deportivo",
    isNew: true,
  },
  {
    id: "8",
    title: "Blusa Ligera",
    price: 42,
    compareAtPrice: 55,
    image: "/placeholder.svg?width=400&height=400&text=Blusa+Verano",
    rating: 4.7,
    reviewCount: 89,
    handle: "blusa-ligera",
    isNew: false,
  },
]

export default function VeranoPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")

  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Colección Verano</h1>
          <p className="text-xl md:text-2xl mb-8">Descubre los estilos más frescos para la temporada</p>
          <Badge className="bg-white text-orange-500 text-lg px-4 py-2">Hasta 30% OFF</Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros y ordenamiento */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-950"
            >
              <option value="featured">Destacados</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
              <option value="newest">Más Nuevos</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid de productos */}
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
        >
          {veranoProducts.map((product) => (
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
                  {product.isNew && <Badge className="absolute top-2 left-2 bg-green-500">Nuevo</Badge>}
                  {product.compareAtPrice && (
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                    </Badge>
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

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-950">${product.price}</span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-gray-500 line-through">${product.compareAtPrice}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Banner promocional */}
        <div className="mt-16 bg-gradient-to-r from-blue-950 to-blue-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¡No te pierdas nuestras ofertas de verano!</h2>
          <p className="text-xl mb-6">Envío gratis en compras superiores a $50</p>
          <Button className="bg-white text-blue-950 hover:bg-gray-100">Ver todas las ofertas</Button>
        </div>
      </div>
    </div>
  )
}

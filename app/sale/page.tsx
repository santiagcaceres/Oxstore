"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Grid, List, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const saleProducts = [
  {
    id: 1,
    name: "Remera Básica",
    originalPrice: 50,
    salePrice: 35,
    category: "Remeras",
    gender: "Hombre",
    imageUrl: "/placeholder.svg?width=400&height=400&text=Remera+Sale",
    handle: "remera-basica-sale",
    discount: 30,
  },
  {
    id: 2,
    name: "Jean Vintage",
    originalPrice: 120,
    salePrice: 85,
    category: "Pantalones",
    gender: "Mujer",
    imageUrl: "/placeholder.svg?width=400&height=400&text=Jean+Sale",
    handle: "jean-vintage-sale",
    discount: 29,
  },
  {
    id: 3,
    name: "Buzo Oversize",
    originalPrice: 90,
    salePrice: 65,
    category: "Buzos",
    gender: "Unisex",
    imageUrl: "/placeholder.svg?width=400&height=400&text=Buzo+Sale",
    handle: "buzo-oversize-sale",
    discount: 28,
  },
  {
    id: 4,
    name: "Vestido Floral",
    originalPrice: 110,
    salePrice: 75,
    category: "Vestidos",
    gender: "Mujer",
    imageUrl: "/placeholder.svg?width=400&height=400&text=Vestido+Sale",
    handle: "vestido-floral-sale",
    discount: 32,
  },
]

type CategoryFilter = "Todos" | "Remeras" | "Pantalones" | "Buzos" | "Vestidos"
type GenderFilter = "Todos" | "Hombre" | "Mujer" | "Unisex"

export default function SalePage() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("Todos")
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("Todos")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredProducts = useMemo(() => {
    return saleProducts.filter((product) => {
      const categoryMatch = categoryFilter === "Todos" || product.category === categoryFilter
      const genderMatch = genderFilter === "Todos" || product.gender === genderFilter
      return categoryMatch && genderMatch
    })
  }, [categoryFilter, genderFilter])

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SALE</h1>
          <p className="text-gray-600">Hasta 50% de descuento en productos seleccionados</p>
          <div className="mt-4 inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold">
            ¡Ofertas por tiempo limitado!
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b">
          <div className="flex flex-wrap gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  {categoryFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todos", "Remeras", "Pantalones", "Buzos", "Vestidos"] as CategoryFilter[]).map((category) => (
                  <DropdownMenuItem key={category} onSelect={() => setCategoryFilter(category)}>
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Género: {genderFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todos", "Hombre", "Mujer", "Unisex"] as GenderFilter[]).map((gender) => (
                  <DropdownMenuItem key={gender} onSelect={() => setGenderFilter(gender)}>
                    {gender}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contador de productos */}
        <div className="mb-6">
          <p className="text-gray-600">{filteredProducts.length} productos en oferta</p>
        </div>

        {/* Grid de productos */}
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"
          }
        >
          {filteredProducts.map((product) => (
            <Link href={`/producto/${product.handle}`} key={product.id} className="group">
              {viewMode === "grid" ? (
                <div className="bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="relative aspect-square">
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white">-{product.discount}%</Badge>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-red-600 font-bold text-xl">${product.salePrice}</span>
                      <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-1 right-1 bg-red-500 text-white text-xs">-{product.discount}%</Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {product.category} • {product.gender}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-red-600 font-bold text-xl">${product.salePrice}</span>
                      <span className="text-gray-400 line-through">${product.originalPrice}</span>
                    </div>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

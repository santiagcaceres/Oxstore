"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Grid, List, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const newProducts = [
  {
    id: 1,
    name: "Remera Premium Cotton",
    price: 45,
    category: "Remeras",
    gender: "Hombre",
    imageUrl: "/placeholder.svg?width=400&height=400&text=Remera+Nueva",
    handle: "remera-premium-cotton",
    daysOld: 5,
  },
  {
    id: 2,
    name: "Vestido Midi Elegante",
    price: 95,
    category: "Vestidos",
    gender: "Mujer",
    imageUrl: "/placeholder.svg?width=400&height=400&text=Vestido+Nuevo",
    handle: "vestido-midi-elegante",
    daysOld: 3,
  },
  {
    id: 3,
    name: "Sneakers Urban",
    price: 120,
    category: "Calzado",
    gender: "Unisex",
    imageUrl: "/placeholder.svg?width=400&height=400&text=Sneakers+Nuevos",
    handle: "sneakers-urban",
    daysOld: 1,
  },
  {
    id: 4,
    name: "Campera Bomber",
    price: 110,
    category: "Camperas",
    gender: "Hombre",
    imageUrl: "/placeholder.svg?width=400&height=400&text=Campera+Nueva",
    handle: "campera-bomber",
    daysOld: 7,
  },
]

type CategoryFilter = "Todos" | "Remeras" | "Vestidos" | "Calzado" | "Camperas"
type GenderFilter = "Todos" | "Hombre" | "Mujer" | "Unisex"

export default function NewPage() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("Todos")
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("Todos")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredProducts = useMemo(() => {
    return newProducts.filter((product) => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">NUEVO</h1>
          <p className="text-gray-600">Los últimos productos que llegaron a OXSTORE</p>
          <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
            ¡Recién llegados!
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
                {(["Todos", "Remeras", "Vestidos", "Calzado", "Camperas"] as CategoryFilter[]).map((category) => (
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
          <p className="text-gray-600">{filteredProducts.length} productos nuevos</p>
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
                    <Badge className="absolute top-3 right-3 bg-blue-950 text-white">Nuevo</Badge>
                    <div className="absolute top-3 left-3 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                      Hace {product.daysOld} día{product.daysOld !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <p className="text-blue-950 font-bold text-xl">${product.price}</p>
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
                    <Badge className="absolute top-1 right-1 bg-blue-950 text-white text-xs">Nuevo</Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {product.category} • {product.gender}
                    </p>
                    <p className="text-xs text-gray-400 mb-1">
                      Hace {product.daysOld} día{product.daysOld !== 1 ? "s" : ""}
                    </p>
                    <p className="text-blue-950 font-bold text-xl">${product.price}</p>
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

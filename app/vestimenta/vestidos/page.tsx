"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Grid, List, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const vestidosProducts = [
  {
    id: 1,
    name: "Vestido Floral",
    price: 85,
    style: "Casual",
    length: "Midi",
    occasion: "Diario",
    color: "Floral",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Vestido+Floral",
    handle: "vestido-floral",
  },
  {
    id: 2,
    name: "Vestido de Noche",
    price: 145,
    style: "Elegante",
    length: "Largo",
    occasion: "Fiesta",
    color: "Negro",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Vestido+Noche",
    handle: "vestido-noche",
  },
  {
    id: 3,
    name: "Vestido Camisero",
    price: 68,
    style: "Casual",
    length: "Midi",
    occasion: "Trabajo",
    color: "Azul",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Vestido+Camisero",
    handle: "vestido-camisero",
  },
  {
    id: 4,
    name: "Vestido Maxi",
    price: 95,
    style: "Bohemio",
    length: "Largo",
    occasion: "Playa",
    color: "Blanco",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Vestido+Maxi",
    handle: "vestido-maxi",
  },
  {
    id: 5,
    name: "Vestido Coctel",
    price: 125,
    style: "Elegante",
    length: "Corto",
    occasion: "Fiesta",
    color: "Rojo",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Vestido+Coctel",
    handle: "vestido-coctel",
  },
  {
    id: 6,
    name: "Vestido Deportivo",
    price: 55,
    style: "Deportivo",
    length: "Corto",
    occasion: "Deporte",
    color: "Gris",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Vestido+Deportivo",
    handle: "vestido-deportivo",
  },
]

type StyleFilter = "Todos" | "Casual" | "Elegante" | "Bohemio" | "Deportivo"
type LengthFilter = "Todos" | "Corto" | "Midi" | "Largo"
type OccasionFilter = "Todas" | "Diario" | "Trabajo" | "Fiesta" | "Playa" | "Deporte"
type SortOption = "Relevancia" | "Precio: Menor a Mayor" | "Precio: Mayor a Menor" | "Más Nuevos"

export default function VestidosPage() {
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("Todos")
  const [lengthFilter, setLengthFilter] = useState<LengthFilter>("Todos")
  const [occasionFilter, setOccasionFilter] = useState<OccasionFilter>("Todas")
  const [sortBy, setSortBy] = useState<SortOption>("Relevancia")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = vestidosProducts.filter((product) => {
      const styleMatch = styleFilter === "Todos" || product.style === styleFilter
      const lengthMatch = lengthFilter === "Todos" || product.length === lengthFilter
      const occasionMatch = occasionFilter === "Todas" || product.occasion === occasionFilter
      return styleMatch && lengthMatch && occasionMatch
    })

    switch (sortBy) {
      case "Precio: Menor a Mayor":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "Precio: Mayor a Menor":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "Más Nuevos":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      default:
        break
    }

    return filtered
  }, [styleFilter, lengthFilter, occasionFilter, sortBy])

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-950">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/vestimenta" className="hover:text-blue-950">
            Vestimenta
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Vestidos</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vestidos</h1>
          <p className="text-gray-600">Elegancia y feminidad para cada ocasión</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b">
          <div className="flex flex-wrap gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Estilo: {styleFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todos", "Casual", "Elegante", "Bohemio", "Deportivo"] as StyleFilter[]).map((style) => (
                  <DropdownMenuItem key={style} onSelect={() => setStyleFilter(style)}>
                    {style}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Largo: {lengthFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todos", "Corto", "Midi", "Largo"] as LengthFilter[]).map((length) => (
                  <DropdownMenuItem key={length} onSelect={() => setLengthFilter(length)}>
                    {length}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Ocasión: {occasionFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todas", "Diario", "Trabajo", "Fiesta", "Playa", "Deporte"] as OccasionFilter[]).map((occasion) => (
                  <DropdownMenuItem key={occasion} onSelect={() => setOccasionFilter(occasion)}>
                    {occasion}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Ordenar: {sortBy}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Relevancia", "Precio: Menor a Mayor", "Precio: Mayor a Menor", "Más Nuevos"] as SortOption[]).map(
                  (option) => (
                    <DropdownMenuItem key={option} onSelect={() => setSortBy(option)}>
                      {option}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
        </div>

        <div className="mb-6">
          <p className="text-gray-600">{filteredAndSortedProducts.length} vestidos encontrados</p>
        </div>

        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"
          }
        >
          {filteredAndSortedProducts.map((product) => (
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
                    {product.isNew && <Badge className="absolute top-3 right-3 bg-blue-950 text-white">Nuevo</Badge>}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {product.style} • {product.length}
                    </p>
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
                    {product.isNew && (
                      <Badge className="absolute top-1 right-1 bg-blue-950 text-white text-xs">Nuevo</Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {product.style} • {product.length} • {product.occasion}
                    </p>
                    <p className="text-blue-950 font-bold text-xl mt-1">${product.price}</p>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron vestidos con los filtros seleccionados.</p>
            <Button
              onClick={() => {
                setStyleFilter("Todos")
                setLengthFilter("Todos")
                setOccasionFilter("Todas")
              }}
              className="mt-4 bg-blue-950 hover:bg-blue-900"
            >
              Limpiar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

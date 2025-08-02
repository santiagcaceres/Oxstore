"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Grid, List, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const gorrasProducts = [
  {
    id: 1,
    name: "Gorra Snapback Classic",
    price: 25,
    style: "Snapback",
    material: "Algodón",
    color: "Negro",
    brand: "Urban",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Gorra+Snapback",
    handle: "gorra-snapback-classic",
  },
  {
    id: 2,
    name: "Gorra Trucker Mesh",
    price: 22,
    style: "Trucker",
    material: "Mesh",
    color: "Azul",
    brand: "Street",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Gorra+Trucker",
    handle: "gorra-trucker-mesh",
  },
  {
    id: 3,
    name: "Gorra Dad Hat",
    price: 28,
    style: "Dad Hat",
    material: "Algodón",
    color: "Blanco",
    brand: "Classic",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Dad+Hat",
    handle: "gorra-dad-hat",
  },
  {
    id: 4,
    name: "Gorra Beanie",
    price: 18,
    style: "Beanie",
    material: "Lana",
    color: "Gris",
    brand: "Winter",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Beanie",
    handle: "gorra-beanie",
  },
]

type StyleFilter = "Todos" | "Snapback" | "Trucker" | "Dad Hat" | "Beanie"
type MaterialFilter = "Todos" | "Algodón" | "Mesh" | "Lana"
type SortOption = "Relevancia" | "Precio: Menor a Mayor" | "Precio: Mayor a Menor" | "Más Nuevos"

export default function GorrasPage() {
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("Todos")
  const [materialFilter, setMaterialFilter] = useState<MaterialFilter>("Todos")
  const [sortBy, setSortBy] = useState<SortOption>("Relevancia")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = gorrasProducts.filter((product) => {
      const styleMatch = styleFilter === "Todos" || product.style === styleFilter
      const materialMatch = materialFilter === "Todos" || product.material === materialFilter
      return styleMatch && materialMatch
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
  }, [styleFilter, materialFilter, sortBy])

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-950">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/accesorios" className="hover:text-blue-950">
            Accesorios
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Gorras</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gorras</h1>
          <p className="text-gray-600">Completa tu look con nuestras gorras de estilo</p>
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
                {(["Todos", "Snapback", "Trucker", "Dad Hat", "Beanie"] as StyleFilter[]).map((style) => (
                  <DropdownMenuItem key={style} onSelect={() => setStyleFilter(style)}>
                    {style}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Material: {materialFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todos", "Algodón", "Mesh", "Lana"] as MaterialFilter[]).map((material) => (
                  <DropdownMenuItem key={material} onSelect={() => setMaterialFilter(material)}>
                    {material}
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
          <p className="text-gray-600">{filteredAndSortedProducts.length} gorras encontradas</p>
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
                      {product.style} • {product.material}
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
                      {product.style} • {product.material} • {product.brand}
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
            <p className="text-gray-500 text-lg">No se encontraron gorras con los filtros seleccionados.</p>
            <Button
              onClick={() => {
                setStyleFilter("Todos")
                setMaterialFilter("Todos")
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

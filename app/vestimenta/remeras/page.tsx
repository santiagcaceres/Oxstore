"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Grid, List, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const remerasProducts = [
  {
    id: 1,
    name: "Remera Básica Algodón",
    price: 35,
    gender: "Hombre",
    style: "Básica",
    color: "Negro",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Remera+Básica+Hombre",
    handle: "remera-basica-algodon-hombre",
  },
  {
    id: 2,
    name: "Remera Oversize",
    price: 42,
    gender: "Mujer",
    style: "Oversize",
    color: "Blanco",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Remera+Oversize+Mujer",
    handle: "remera-oversize-mujer",
  },
  {
    id: 3,
    name: "Remera Estampada",
    price: 45,
    gender: "Hombre",
    style: "Estampada",
    color: "Gris",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Remera+Estampada+Hombre",
    handle: "remera-estampada-hombre",
  },
  {
    id: 4,
    name: "Remera Crop Top",
    price: 38,
    gender: "Mujer",
    style: "Crop",
    color: "Rosa",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Crop+Top+Mujer",
    handle: "remera-crop-top-mujer",
  },
  {
    id: 5,
    name: "Remera Polo",
    price: 55,
    gender: "Hombre",
    style: "Polo",
    color: "Azul",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Polo+Hombre",
    handle: "remera-polo-hombre",
  },
  {
    id: 6,
    name: "Remera Manga Larga",
    price: 48,
    gender: "Mujer",
    style: "Manga Larga",
    color: "Negro",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Manga+Larga+Mujer",
    handle: "remera-manga-larga-mujer",
  },
]

type GenderFilter = "Todos" | "Hombre" | "Mujer"
type StyleFilter = "Todos" | "Básica" | "Oversize" | "Estampada" | "Crop" | "Polo" | "Manga Larga"
type ColorFilter = "Todos" | "Negro" | "Blanco" | "Gris" | "Rosa" | "Azul"
type SortOption = "Relevancia" | "Precio: Menor a Mayor" | "Precio: Mayor a Menor" | "Más Nuevos"

export default function RemerasPage() {
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("Todos")
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("Todos")
  const [colorFilter, setColorFilter] = useState<ColorFilter>("Todos")
  const [sortBy, setSortBy] = useState<SortOption>("Relevancia")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = remerasProducts.filter((product) => {
      const genderMatch = genderFilter === "Todos" || product.gender === genderFilter
      const styleMatch = styleFilter === "Todos" || product.style === styleFilter
      const colorMatch = colorFilter === "Todos" || product.color === colorFilter
      return genderMatch && styleMatch && colorMatch
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
  }, [genderFilter, styleFilter, colorFilter, sortBy])

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
          <span className="text-gray-900 font-medium">Remeras</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Remeras</h1>
          <p className="text-gray-600">Encuentra la remera perfecta para tu estilo</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b">
          <div className="flex flex-wrap gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Género: {genderFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todos", "Hombre", "Mujer"] as GenderFilter[]).map((gender) => (
                  <DropdownMenuItem key={gender} onSelect={() => setGenderFilter(gender)}>
                    {gender}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Estilo: {styleFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todos", "Básica", "Oversize", "Estampada", "Crop", "Polo", "Manga Larga"] as StyleFilter[]).map(
                  (style) => (
                    <DropdownMenuItem key={style} onSelect={() => setStyleFilter(style)}>
                      {style}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Color: {colorFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todos", "Negro", "Blanco", "Gris", "Rosa", "Azul"] as ColorFilter[]).map((color) => (
                  <DropdownMenuItem key={color} onSelect={() => setColorFilter(color)}>
                    {color}
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
          <p className="text-gray-600">{filteredAndSortedProducts.length} remeras encontradas</p>
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
                      {product.style} • {product.color}
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
                      {product.style} • {product.color} • {product.gender}
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
            <p className="text-gray-500 text-lg">No se encontraron remeras con los filtros seleccionados.</p>
            <Button
              onClick={() => {
                setGenderFilter("Todos")
                setStyleFilter("Todos")
                setColorFilter("Todos")
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

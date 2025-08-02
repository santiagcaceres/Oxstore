"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Grid, List, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const camperasProducts = [
  {
    id: 1,
    name: "Campera Bomber",
    price: 125,
    gender: "Hombre",
    style: "Bomber",
    material: "Nylon",
    season: "Invierno",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Campera+Bomber+Hombre",
    handle: "campera-bomber-hombre",
  },
  {
    id: 2,
    name: "Campera Denim",
    price: 98,
    gender: "Mujer",
    style: "Denim",
    material: "Algodón",
    season: "Todo el año",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Campera+Denim+Mujer",
    handle: "campera-denim-mujer",
  },
  {
    id: 3,
    name: "Parka Impermeable",
    price: 155,
    gender: "Hombre",
    style: "Parka",
    material: "Poliéster",
    season: "Invierno",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Parka+Hombre",
    handle: "parka-impermeable-hombre",
  },
  {
    id: 4,
    name: "Blazer Elegante",
    price: 135,
    gender: "Mujer",
    style: "Blazer",
    material: "Lana",
    season: "Todo el año",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Blazer+Mujer",
    handle: "blazer-elegante-mujer",
  },
  {
    id: 5,
    name: "Campera Deportiva",
    price: 88,
    gender: "Hombre",
    style: "Deportiva",
    material: "Poliéster",
    season: "Todo el año",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Campera+Deportiva+Hombre",
    handle: "campera-deportiva-hombre",
  },
  {
    id: 6,
    name: "Chaqueta de Cuero",
    price: 185,
    gender: "Mujer",
    style: "Cuero",
    material: "Cuero",
    season: "Todo el año",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Chaqueta+Cuero+Mujer",
    handle: "chaqueta-cuero-mujer",
  },
]

type GenderFilter = "Todos" | "Hombre" | "Mujer"
type StyleFilter = "Todos" | "Bomber" | "Denim" | "Parka" | "Blazer" | "Deportiva" | "Cuero"
type MaterialFilter = "Todos" | "Nylon" | "Algodón" | "Poliéster" | "Lana" | "Cuero"
type SeasonFilter = "Todas" | "Invierno" | "Todo el año"
type SortOption = "Relevancia" | "Precio: Menor a Mayor" | "Precio: Mayor a Menor" | "Más Nuevos"

export default function CamperasPage() {
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("Todos")
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("Todos")
  const [materialFilter, setMaterialFilter] = useState<MaterialFilter>("Todos")
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>("Todas")
  const [sortBy, setSortBy] = useState<SortOption>("Relevancia")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = camperasProducts.filter((product) => {
      const genderMatch = genderFilter === "Todos" || product.gender === genderFilter
      const styleMatch = styleFilter === "Todos" || product.style === styleFilter
      const materialMatch = materialFilter === "Todos" || product.material === materialFilter
      const seasonMatch = seasonFilter === "Todas" || product.season === seasonFilter
      return genderMatch && styleMatch && materialMatch && seasonMatch
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
  }, [genderFilter, styleFilter, materialFilter, seasonFilter, sortBy])

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
          <span className="text-gray-900 font-medium">Camperas</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Camperas</h1>
          <p className="text-gray-600">Estilo y protección para todas las estaciones</p>
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
                {(["Todos", "Bomber", "Denim", "Parka", "Blazer", "Deportiva", "Cuero"] as StyleFilter[]).map(
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
                  Material: {materialFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todos", "Nylon", "Algodón", "Poliéster", "Lana", "Cuero"] as MaterialFilter[]).map((material) => (
                  <DropdownMenuItem key={material} onSelect={() => setMaterialFilter(material)}>
                    {material}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Temporada: {seasonFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todas", "Invierno", "Todo el año"] as SeasonFilter[]).map((season) => (
                  <DropdownMenuItem key={season} onSelect={() => setSeasonFilter(season)}>
                    {season}
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
          <p className="text-gray-600">{filteredAndSortedProducts.length} camperas encontradas</p>
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
                      {product.style} • {product.material} • {product.gender}
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
            <p className="text-gray-500 text-lg">No se encontraron camperas con los filtros seleccionados.</p>
            <Button
              onClick={() => {
                setGenderFilter("Todos")
                setStyleFilter("Todos")
                setMaterialFilter("Todos")
                setSeasonFilter("Todas")
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

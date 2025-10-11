"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Palette,
  Brush,
  Droplets,
  PenTool,
  Layers,
  Pencil,
  Shapes,
  Calendar,
  Box,
} from "lucide-react"
import { trackCategoryFilter, trackSearch } from "@/lib/gtag"

interface Artwork {
  id: string
  title: string
  category: string
  subcategory?: string
  price: number
  description: string
  status: string
  main_image_url?: string
  year?: number
  created_at: string
}

interface ObrasClientPageProps {
  artworks: Artwork[]
}

const CATEGORIES = [
  { id: "todos", label: "Todas", count: 0, icon: Palette },
  { id: "oleos", label: "Óleos", count: 0, icon: Brush },
  { id: "oleo-pastel", label: "Óleo Pastel", count: 0, icon: Layers },
  { id: "acrilicos", label: "Acrílicos", count: 0, icon: Palette },
  { id: "tecnica-mixta", label: "Técnica Mixta", count: 0, icon: Shapes },
  { id: "acuarelas", label: "Acuarelas", count: 0, icon: Droplets },
  { id: "dibujos", label: "Dibujos", count: 0, icon: Pencil },
  { id: "esculturas", label: "Esculturas", count: 0, icon: Box },
  { id: "otros", label: "Otros", count: 0, icon: PenTool },
]

const STATUS_OPTIONS = [
  { id: "todos", label: "Todos los Estados" },
  { id: "Disponible", label: "Disponibles" },
  { id: "Vendida", label: "Vendidas" },
]

const SORT_OPTIONS = [
  { id: "default", label: "Orden por Defecto", icon: ArrowUp },
  { id: "price-asc", label: "Menor Precio", icon: ArrowUp },
  { id: "price-desc", label: "Mayor Precio", icon: ArrowDown },
]

export default function ObrasClientPage({ artworks }: ObrasClientPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [selectedStatus, setSelectedStatus] = useState("todos")
  const [selectedSort, setSelectedSort] = useState("default")
  const [selectedYear, setSelectedYear] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Obtener años únicos de las obras
  const availableYears = useMemo(() => {
    const years = artworks
      .map((artwork) => artwork.year)
      .filter((year): year is number => year !== undefined && year !== null)
      .sort((a, b) => b - a) // Ordenar de más reciente a más antiguo

    return Array.from(new Set(years))
  }, [artworks])

  // Calcular conteos de categorías
  const categoriesWithCounts = useMemo(() => {
    return CATEGORIES.map((category) => ({
      ...category,
      count:
        category.id === "todos"
          ? artworks.length
          : artworks.filter((artwork) => artwork.category === category.id).length,
    }))
  }, [artworks])

  // Filtrar y ordenar obras
  const filteredAndSortedArtworks = useMemo(() => {
    let filtered = artworks

    // Filtrar por categoría
    if (selectedCategory !== "todos") {
      filtered = filtered.filter((artwork) => artwork.category === selectedCategory)
    }

    // Filtrar por estado
    if (selectedStatus !== "todos") {
      filtered = filtered.filter((artwork) => artwork.status === selectedStatus)
    }

    // Filtrar por año
    if (selectedYear !== "todos") {
      filtered = filtered.filter((artwork) => artwork.year === Number(selectedYear))
    }

    // Filtrar por búsqueda
    if (searchTerm !== "") {
      filtered = filtered.filter(
        (artwork) =>
          artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          artwork.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Ordenar
    switch (selectedSort) {
      case "price-asc":
        return [...filtered].sort((a, b) => a.price - b.price)
      case "price-desc":
        return [...filtered].sort((a, b) => b.price - a.price)
      default:
        return filtered
    }
  }, [artworks, selectedCategory, selectedStatus, selectedYear, searchTerm, selectedSort])

  const clearFilters = () => {
    setSelectedCategory("todos")
    setSelectedStatus("todos")
    setSelectedSort("default")
    setSelectedYear("todos")
    setSearchTerm("")
  }

  const hasActiveFilters =
    selectedCategory !== "todos" ||
    selectedStatus !== "todos" ||
    selectedSort !== "default" ||
    selectedYear !== "todos" ||
    searchTerm !== ""

  // Handle category filter with analytics
  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId)
    trackCategoryFilter(categoryId)
  }

  // Handle search with analytics
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.length > 2) {
      trackSearch(term)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Fondo artístico global */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-yellow-200/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-200/25 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4 md:py-6">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/images/negro-lucho.png"
                alt="Fulco Logo - Volver al inicio"
                width={150}
                height={75}
                className="h-10 md:h-12 w-auto"
                priority
              />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 font-serif-display">Todas las Obras</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Explora la colección completa de obras de Luciano Fulco. Cada pieza cuenta una historia única a través del
            color, la forma y la emoción.
          </p>
        </div>

        {/* FILTROS MINIMALISTAS */}
        <div className="bg-white/95 backdrop-blur-sm border shadow-sm rounded-lg mb-8">
          <div className="p-4">
            {/* Barra de búsqueda */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar obras..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-9 px-3 text-sm"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtros
                {(selectedStatus !== "todos" || selectedSort !== "default" || selectedYear !== "todos") && (
                  <span className="ml-1 w-1.5 h-1.5 bg-black rounded-full"></span>
                )}
              </Button>
            </div>

            {/* CATEGORÍAS MINIMALISTAS - SIEMPRE VISIBLES */}
            <div className="flex flex-wrap gap-2">
              {categoriesWithCounts.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === category.id
                        ? "bg-black text-white"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {category.label}
                    <span className={`${selectedCategory === category.id ? "text-white/70" : "text-gray-500"}`}>
                      ({category.count})
                    </span>
                  </button>
                )
              })}
            </div>

            {/* FILTROS ADICIONALES */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t space-y-3">
                {/* Filtro por Año */}
                {availableYears.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Año</label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedYear === "todos" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedYear("todos")}
                        className={`h-8 px-3 text-xs ${
                          selectedYear === "todos" ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-50"
                        }`}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Todos los años
                      </Button>
                      {availableYears.map((year) => (
                        <Button
                          key={year}
                          variant={selectedYear === year.toString() ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedYear(year.toString())}
                          className={`h-8 px-3 text-xs ${
                            selectedYear === year.toString()
                              ? "bg-black text-white hover:bg-gray-800"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {year}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ordenamiento */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Ordenar</label>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map((option) => {
                      const Icon = option.icon
                      return (
                        <Button
                          key={option.id}
                          variant={selectedSort === option.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSort(option.id)}
                          className={`h-8 px-3 text-xs ${
                            selectedSort === option.id ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {option.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Estado</label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <Button
                        key={status.id}
                        variant={selectedStatus === status.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus(status.id)}
                        className={`h-8 px-3 text-xs ${
                          selectedStatus === status.id ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-50"
                        }`}
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Limpiar filtros */}
                {hasActiveFilters && (
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-3 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredAndSortedArtworks.length === 0
              ? "No se encontraron obras"
              : `${filteredAndSortedArtworks.length} de ${artworks.length} obras`}
            {selectedSort !== "default" && (
              <span className="ml-2 text-xs text-gray-500">
                • {SORT_OPTIONS.find((opt) => opt.id === selectedSort)?.label}
              </span>
            )}
            {selectedYear !== "todos" && <span className="ml-2 text-xs text-gray-500">• Año {selectedYear}</span>}
          </p>
        </div>

        {/* Grid de obras */}
        {filteredAndSortedArtworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500 mb-2">No se encontraron obras</p>
            <p className="text-sm text-gray-400 mb-4">Intenta ajustar los filtros</p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                Ver todas las obras
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredAndSortedArtworks.map((artwork) => (
              <Link key={artwork.id} href={`/obra/${artwork.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border border-white/20 group">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={
                        artwork.main_image_url ||
                        `https://placehold.co/400x400/E5E7EB/374151/jpeg?text=${encodeURIComponent(artwork.title) || "/placeholder.svg"}`
                      }
                      alt={artwork.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      quality={90}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      onError={(e) => {
                        console.error("Error loading artwork image:", artwork.main_image_url)
                        e.currentTarget.src = `https://placehold.co/400x400/E5E7EB/374151/jpeg?text=Error+cargando+imagen`
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{artwork.title}</h3>
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 mt-1 ${
                          artwork.status === "Disponible" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{artwork.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-gray-900">USD {artwork.price}</p>
                      <div className="flex gap-1">
                        <Badge className="capitalize text-xs">{artwork.category}</Badge>
                        {artwork.status === "Vendida" && (
                          <Badge variant="destructive" className="text-xs">
                            Vendida
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

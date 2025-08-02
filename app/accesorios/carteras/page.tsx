"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Grid, List, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const carterasProducts = [
  {
    id: 1,
    name: "Cartera de Cuero Premium",
    price: 85,
    style: "Bandolera",
    material: "Cuero",
    color: "Negro",
    size: "Mediana",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Cartera+Cuero",
    handle: "cartera-cuero-premium",
  },
  {
    id: 2,
    name: "Bolso Tote Canvas",
    price: 45,
    style: "Tote",
    material: "Canvas",
    color: "Beige",
    size: "Grande",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Bolso+Tote",
    handle: "bolso-tote-canvas",
  },
  {
    id: 3,
    name: "Clutch Elegante",
    price: 65,
    style: "Clutch",
    material: "Sintético",
    color: "Dorado",
    size: "Pequeña",
    isNew: true,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Clutch",
    handle: "clutch-elegante",
  },
  {
    id: 4,
    name: "Mochila Urban",
    price: 75,
    style: "Mochila",
    material: "Nylon",
    color: "Negro",
    size: "Grande",
    isNew: false,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Mochila",
    handle: "mochila-urban",
  },
]

type StyleFilter = "Todos" | "Bandolera" | "Tote" | "Clutch" | "Mochila"
type MaterialFilter = "Todos" | "Cuero" | "Canvas" | "Sintético" | "Nylon"
type SizeFilter = "Todos" | "Pequeña" | "Mediana" | "Grande"

export default function CarterasPage() {
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("Todos")
  const [materialFilter, setMaterialFilter] = useState<MaterialFilter>("Todos")
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("Todos")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredProducts = useMemo(() => {
    return carterasProducts.filter((product) => {
      const styleMatch = styleFilter === "Todos" || product.style === styleFilter
      const materialMatch = materialFilter === "Todos" || product.material === materialFilter
      const sizeMatch = sizeFilter === "Todos" || product.size === sizeFilter
      return styleMatch && materialMatch && sizeMatch
    })
  }, [styleFilter, materialFilter, sizeFilter])

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-950">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/accesorios" className="hover:text-blue-950">
            Accesorios
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Carteras</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Carteras</h1>
          <p className="text-gray-600">Encuentra la cartera perfecta para cada ocasión</p>
        </div>

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
                {(["Todos", "Bandolera", "Tote", "Clutch", "Mochila"] as StyleFilter[]).map((style) => (
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
                {(["Todos", "Cuero", "Canvas", "Sintético", "Nylon"] as MaterialFilter[]).map((material) => (
                  <DropdownMenuItem key={material} onSelect={() => setMaterialFilter(material)}>
                    {material}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Tamaño: {sizeFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Todos", "Pequeña", "Mediana", "Grande"] as SizeFilter[]).map((size) => (
                  <DropdownMenuItem key={size} onSelect={() => setSizeFilter(size)}>
                    {size}
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

        <div className="mb-6">
          <p className="text-gray-600">{filteredProducts.length} carteras encontradas</p>
        </div>

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
                      {product.style} • {product.material} • {product.size}
                    </p>
                    <p className="text-blue-950 font-bold text-xl mt-1">${product.price}</p>
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

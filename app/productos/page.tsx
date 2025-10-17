"use client"

import type React from "react"

import { useState } from "react"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Search, Filter } from "lucide-react"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [currentSearch, setCurrentSearch] = useState("")

  const handleSearch = () => {
    setCurrentSearch(searchTerm)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header is removed as it's now in the layout principal */}

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Productos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Todos los Productos</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explora nuestra colección completa de productos de alta calidad
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Destacados</SelectItem>
                <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                <SelectItem value="newest">Más Recientes</SelectItem>
                <SelectItem value="name">Nombre A-Z</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results Info */}
        {currentSearch && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Resultados para: <span className="font-medium text-foreground">"{currentSearch}"</span>
            </p>
          </div>
        )}

        {/* Products Grid */}
        <ProductGrid search={currentSearch} limit={1000} sortBy={sortBy} />
      </main>

      <Footer />
    </div>
  )
}

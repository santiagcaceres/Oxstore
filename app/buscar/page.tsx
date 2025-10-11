"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Search } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [currentSearch, setCurrentSearch] = useState(initialQuery)

  useEffect(() => {
    setCurrentSearch(initialQuery)
  }, [initialQuery])

  const handleSearch = () => {
    setCurrentSearch(searchTerm)
    // Update URL without page reload
    const url = new URL(window.location.href)
    url.searchParams.set("q", searchTerm)
    window.history.pushState({}, "", url.toString())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Buscar</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Buscar Productos</h1>
          <p className="text-muted-foreground text-lg">Encuentra exactamente lo que buscas</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="¿Qué estás buscando?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 text-lg h-12"
              />
            </div>
            <Button onClick={handleSearch} size="lg">
              Buscar
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {currentSearch ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Resultados para: <span className="text-primary">"{currentSearch}"</span>
              </h2>
            </div>
            <ProductGrid search={currentSearch} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Ingresa un término de búsqueda para encontrar productos</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

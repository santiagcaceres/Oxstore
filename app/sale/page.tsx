"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SalePage() {
  const [sortBy, setSortBy] = useState<string>("price-asc")
  const [filterBrand, setFilterBrand] = useState<string>("all-brands")
  const [filterColor, setFilterColor] = useState<string>("all-colors")
  const [filterSize, setFilterSize] = useState<string>("all-sizes")

  const brands = [
    "MISTRAL",
    "UNIFORM",
    "LEVI",
    "XKETZIA",
    "INDIANA",
    "KABOA",
    "EMPATHIA",
    "ROTUNDA",
    "LEMON",
    "GATTO",
    "PARDO",
    "MINOT",
    "MANDAL",
    "SYMPHORI",
    "NEUFO",
    "BROOKSFIELD",
    "PEGUIN",
  ]

  const colors = ["Negro", "Blanco", "Azul", "Rojo", "Verde", "Gris", "Beige", "Rosa"]
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

  const getFilterValue = (value: string, prefix: string) => {
    return value === `all-${prefix}` ? "" : value
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SALE</h1>
          <p className="text-muted-foreground">Productos en oferta con los mejores precios</p>
        </div>

        {/* Filtros y ordenamiento */}
        <div className="mb-8 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-brands">Todas las marcas</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterColor} onValueChange={setFilterColor}>
              <SelectTrigger>
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-colors">Todos los colores</SelectItem>
                {colors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSize} onValueChange={setFilterSize}>
              <SelectTrigger>
                <SelectValue placeholder="Talle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sizes">Todos los talles</SelectItem>
                {sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSortBy("price-asc")
                setFilterBrand("all-brands")
                setFilterColor("all-colors")
                setFilterSize("all-sizes")
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>

        {/* Grid de productos */}
        <ProductGrid
          sortBy={sortBy}
          filterBrand={getFilterValue(filterBrand, "brands")}
          filterColor={getFilterValue(filterColor, "colors")}
          filterSize={getFilterValue(filterSize, "sizes")}
        />
      </main>

      <Footer />
    </div>
  )
}

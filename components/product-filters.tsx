"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    sortBy: string
    filterBrand: string
    filterColor: string
    filterSize: string
  }) => void
}

export function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
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

  const handleFilterChange = (type: string, value: string) => {
    const newFilters = { sortBy, filterBrand, filterColor, filterSize }

    switch (type) {
      case "sort":
        setSortBy(value)
        newFilters.sortBy = value
        break
      case "brand":
        setFilterBrand(value)
        newFilters.filterBrand = value
        break
      case "color":
        setFilterColor(value)
        newFilters.filterColor = value
        break
      case "size":
        setFilterSize(value)
        newFilters.filterSize = value
        break
    }

    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setSortBy("price-asc")
    setFilterBrand("all-brands")
    setFilterColor("all-colors")
    setFilterSize("all-sizes")
    onFiltersChange({
      sortBy: "price-asc",
      filterBrand: "all-brands",
      filterColor: "all-colors",
      filterSize: "all-sizes",
    })
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/30">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Select value={sortBy} onValueChange={(value) => handleFilterChange("sort", value)}>
          <SelectTrigger className="bg-background/80 border-muted/40 hover:border-primary/30 transition-colors">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
            <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterBrand} onValueChange={(value) => handleFilterChange("brand", value)}>
          <SelectTrigger className="bg-background/80 border-muted/40 hover:border-primary/30 transition-colors">
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

        <Select value={filterColor} onValueChange={(value) => handleFilterChange("color", value)}>
          <SelectTrigger className="bg-background/80 border-muted/40 hover:border-primary/30 transition-colors">
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

        <Select value={filterSize} onValueChange={(value) => handleFilterChange("size", value)}>
          <SelectTrigger className="bg-background/80 border-muted/40 hover:border-primary/30 transition-colors">
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
          onClick={clearFilters}
          className="bg-background/80 border-muted/40 hover:bg-muted/20 hover:border-primary/30 transition-colors"
        >
          Limpiar filtros
        </Button>
      </div>
    </div>
  )
}

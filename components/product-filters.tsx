"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    sortBy: string
    filterBrand: string
    filterColor: string
    filterSize: string
  }) => void
  hideBrandFilter?: boolean
}

export function ProductFilters({ onFiltersChange, hideBrandFilter = false }: ProductFiltersProps) {
  const [sortBy, setSortBy] = useState<string>("created_at-desc")
  const [filterBrand, setFilterBrand] = useState<string>("all-brands")
  const [filterColor, setFilterColor] = useState<string>("all-colors")
  const [filterSize, setFilterSize] = useState<string>("all-sizes")
  const [brands, setBrands] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])

  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const supabase = createClient()

        // Cargar marcas únicas
        const { data: brandsData } = await supabase
          .from("products_in_stock")
          .select("brand")
          .gt("stock_quantity", 0)
          .not("brand", "is", null)

        const uniqueBrands = [...new Set(brandsData?.map((item) => item.brand))].sort()
        setBrands(uniqueBrands)

        // Cargar colores únicos
        const { data: colorsData } = await supabase
          .from("products_in_stock")
          .select("color")
          .gt("stock_quantity", 0)
          .not("color", "is", null)

        const uniqueColors = [...new Set(colorsData?.map((item) => item.color))].sort()
        setColors(uniqueColors)

        // Cargar talles únicos
        const { data: sizesData } = await supabase
          .from("products_in_stock")
          .select("size")
          .gt("stock_quantity", 0)
          .not("size", "is", null)

        const uniqueSizes = [...new Set(sizesData?.map((item) => item.size))].sort()
        setSizes(uniqueSizes)
      } catch (error) {
        console.error("Error loading filters data:", error)
      }
    }

    loadFiltersData()
  }, [])

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
    setSortBy("created_at-desc")
    setFilterBrand("all-brands")
    setFilterColor("all-colors")
    setFilterSize("all-sizes")
    onFiltersChange({
      sortBy: "created_at-desc",
      filterBrand: "all-brands",
      filterColor: "all-colors",
      filterSize: "all-sizes",
    })
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/30">
      <div className={`grid grid-cols-2 gap-4 ${hideBrandFilter ? "md:grid-cols-4" : "md:grid-cols-5"}`}>
        <Select value={sortBy} onValueChange={(value) => handleFilterChange("sort", value)}>
          <SelectTrigger className="bg-background/80 border-muted/40 hover:border-primary/30 transition-colors">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Más recientes</SelectItem>
            <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
            <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
          </SelectContent>
        </Select>

        {!hideBrandFilter && (
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
        )}

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
                {size.toUpperCase()}
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

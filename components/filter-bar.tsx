"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X } from "lucide-react"

interface FilterBarProps {
  brands: string[]
}

export function FilterBar({ brands }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const currentBrand = searchParams.get("brand") || "all"
  const currentMinPrice = searchParams.get("minPrice") || "0"
  const currentMaxPrice = searchParams.get("maxPrice") || "999999"
  const currentSort = searchParams.get("sort") || "relevance"

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push(window.location.pathname)
  }

  const hasActiveFilters =
    currentBrand !== "all" || currentMinPrice !== "0" || currentMaxPrice !== "999999" || currentSort !== "relevance"

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && <span className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs">Activos</span>}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Marca</label>
            <Select value={currentBrand} onValueChange={(value) => updateFilters("brand", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las marcas</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Precio mínimo</label>
            <Input
              type="number"
              placeholder="$0"
              value={currentMinPrice}
              onChange={(e) => updateFilters("minPrice", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Precio máximo</label>
            <Input
              type="number"
              placeholder="$999999"
              value={currentMaxPrice}
              onChange={(e) => updateFilters("maxPrice", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ordenar por</label>
            <Select value={currentSort} onValueChange={(value) => updateFilters("sort", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Relevancia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevancia</SelectItem>
                <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

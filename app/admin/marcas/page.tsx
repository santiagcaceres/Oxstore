"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, Search, ImageIcon, ExternalLink, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ZureoBrand {
  id: string
  nombre: string
  descripcion?: string
  activo?: boolean
}

export default function MarcasPage() {
  const [brands, setBrands] = useState<ZureoBrand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<ZureoBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const loadBrands = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/zureo/brands")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error loading brands from Zureo")
      }

      setBrands(data)
    } catch (error) {
      console.error("Error loading brands:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al cargar marcas desde Zureo")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBrands()
  }, [])

  useEffect(() => {
    filterBrands()
  }, [brands, searchTerm])

  const filterBrands = () => {
    let filtered = brands

    if (searchTerm) {
      filtered = filtered.filter((brand) => brand.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFilteredBrands(filtered)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestión de Marcas</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p>Cargando marcas desde Zureo API...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestión de Marcas</h1>
          <Button onClick={loadBrands} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error cargando marcas desde Zureo:</strong> {error}
            <br />
            <br />
            Verifica que las credenciales de Zureo estén configuradas correctamente.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Marcas</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            Total desde Zureo: {brands.length}
          </Badge>
          <Button onClick={loadBrands} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Datos en tiempo real:</strong> Todas las marcas mostradas provienen directamente de la API de Zureo.
          No se utilizan datos de demostración.
        </AlertDescription>
      </Alert>

      {/* Buscador */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de marcas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBrands.map((brand) => (
          <Card key={brand.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{brand.nombre}</CardTitle>
                <div className="flex gap-1">
                  {brand.activo !== false && <Badge className="text-xs bg-green-100 text-green-800">Activa</Badge>}
                </div>
              </div>
              {brand.descripcion && <p className="text-sm text-gray-600 mt-1">{brand.descripcion}</p>}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Preview de imagen */}
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="text-center text-gray-500">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Gestión de imágenes disponible próximamente</p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Logo
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <a href={`/marcas/${brand.nombre?.toLowerCase()}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBrands.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron marcas</h3>
            <p className="text-gray-500">
              {searchTerm ? "Intenta ajustar el término de búsqueda" : "No hay marcas disponibles en Zureo"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

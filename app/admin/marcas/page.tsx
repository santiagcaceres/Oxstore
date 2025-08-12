"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, Search, ImageIcon, Trash2, ExternalLink, AlertCircle } from "lucide-react"
import Image from "next/image"

interface Brand {
  id: string
  name: string
  description: string
  active: boolean
  productCount: number
  hasImage?: boolean
  imageUrl?: string
}

export default function MarcasPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [brandImages, setBrandImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadingBrand, setUploadingBrand] = useState<string | null>(null)

  useEffect(() => {
    loadBrands()
    loadBrandImages()
  }, [])

  useEffect(() => {
    filterBrands()
  }, [brands, searchTerm])

  const loadBrands = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/zureo/brands")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setBrands(data || [])
    } catch (error) {
      console.error("Error loading brands:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al cargar marcas")
    } finally {
      setLoading(false)
    }
  }

  const loadBrandImages = async () => {
    try {
      const response = await fetch("/api/brand-images")
      if (response.ok) {
        const data = await response.json()
        setBrandImages(data)
      }
    } catch (error) {
      console.error("Error loading brand images:", error)
    }
  }

  const filterBrands = () => {
    let filtered = brands

    if (searchTerm) {
      filtered = filtered.filter((brand) => brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    filtered = filtered.map((brand) => {
      const image = brandImages.find((img) => img.brandName === brand.name)
      return {
        ...brand,
        hasImage: !!image,
        imageUrl: image?.imageUrl,
      }
    })

    setFilteredBrands(filtered)
  }

  const handleImageUpload = async (brandName: string, file: File) => {
    try {
      setUploadingBrand(brandName)

      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 5MB")
        return
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("brandName", brandName)

      const response = await fetch("/api/brand-images/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        await loadBrandImages()
        alert("Imagen subida exitosamente")
      } else {
        throw new Error("Error uploading image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error al subir la imagen")
    } finally {
      setUploadingBrand(null)
    }
  }

  const handleDeleteImage = async (brandName: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
      return
    }

    try {
      // Aquí implementarías la eliminación
      alert("Función de eliminación pendiente de implementar")
    } catch (error) {
      console.error("Error deleting image:", error)
      alert("Error al eliminar la imagen")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestión de Marcas</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestión de Marcas</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error al cargar marcas</h3>
                <p className="text-sm mt-1">{error}</p>
                <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={loadBrands}>
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Marcas</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            Total: {brands.length}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Con imagen: {filteredBrands.filter((b) => b.hasImage).length}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Activas: {brands.filter((b) => b.active).length}
          </Badge>
        </div>
      </div>

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
                <CardTitle className="text-lg">{brand.name}</CardTitle>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">
                    {brand.productCount} productos
                  </Badge>
                  {brand.active && <Badge className="text-xs bg-green-100 text-green-800">Activa</Badge>}
                </div>
              </div>
              {brand.description && <p className="text-sm text-gray-600 mt-1">{brand.description}</p>}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Preview de imagen */}
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {brand.hasImage && brand.imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={brand.imageUrl || "/placeholder.svg"}
                      alt={`Logo de ${brand.name}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Sin imagen</p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleImageUpload(brand.name, file)
                      }
                    }}
                    disabled={uploadingBrand === brand.name}
                    className="hidden"
                    id={`upload-${brand.id}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    disabled={uploadingBrand === brand.name}
                    asChild
                  >
                    <label htmlFor={`upload-${brand.id}`} className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingBrand === brand.name ? "Subiendo..." : "Subir Logo"}
                    </label>
                  </Button>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <a href={`/marcas/${brand.name.toLowerCase()}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                {brand.hasImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteImage(brand.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
              {searchTerm ? "Intenta ajustar el término de búsqueda" : "No hay marcas disponibles"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, Search, ImageIcon, Trash2 } from "lucide-react"
import { getAllZureoProducts } from "@/lib/zureo-api"
import { uploadBrandImage, getBrandImages, deleteBrandImage } from "@/lib/supabase"
import type { ZureoProduct } from "@/types/zureo"
import Image from "next/image"

interface Brand {
  id: string
  nombre: string
  productCount: number
  hasImage: boolean
  imageUrl?: string
}

export default function MarcasPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadingBrand, setUploadingBrand] = useState<string | null>(null)

  useEffect(() => {
    loadBrands()
  }, [])

  useEffect(() => {
    filterBrands()
  }, [brands, searchTerm])

  const loadBrands = async () => {
    try {
      setLoading(true)
      const products = await getAllZureoProducts()

      // Agrupar productos por marca
      const brandMap = new Map<string, { nombre: string; count: number }>()

      products.forEach((product: ZureoProduct) => {
        if (product.marca?.nombre && product.marca.nombre.trim()) {
          const brandId = product.marca.id?.toString() || product.marca.nombre
          const existing = brandMap.get(brandId)

          if (existing) {
            existing.count++
          } else {
            brandMap.set(brandId, {
              nombre: product.marca.nombre,
              count: 1,
            })
          }
        }
      })

      // Convertir a array y verificar imágenes
      const brandsArray = await Promise.all(
        Array.from(brandMap.entries()).map(async ([id, data]) => {
          const images = await getBrandImages(id)
          return {
            id,
            nombre: data.nombre,
            productCount: data.count,
            hasImage: images.length > 0,
            imageUrl: images[0]?.image_url,
          }
        }),
      )

      // Ordenar por nombre
      brandsArray.sort((a, b) => a.nombre.localeCompare(b.nombre))

      setBrands(brandsArray)
    } catch (error) {
      console.error("Error loading brands:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterBrands = () => {
    let filtered = brands

    if (searchTerm) {
      filtered = filtered.filter((brand) => brand.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFilteredBrands(filtered)
  }

  const handleImageUpload = async (brandId: string, file: File) => {
    try {
      setUploadingBrand(brandId)

      // Validar archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 5MB")
        return
      }

      const imageUrl = await uploadBrandImage(brandId, file)

      // Actualizar estado local
      setBrands(brands.map((brand) => (brand.id === brandId ? { ...brand, hasImage: true, imageUrl } : brand)))

      alert("Imagen subida exitosamente")
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error al subir la imagen")
    } finally {
      setUploadingBrand(null)
    }
  }

  const handleDeleteImage = async (brandId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
      return
    }

    try {
      await deleteBrandImage(brandId)

      // Actualizar estado local
      setBrands(
        brands.map((brand) => (brand.id === brandId ? { ...brand, hasImage: false, imageUrl: undefined } : brand)),
      )

      alert("Imagen eliminada exitosamente")
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Marcas</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            Total: {brands.length}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Con imagen: {brands.filter((b) => b.hasImage).length}
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
                <CardTitle className="text-lg">{brand.nombre}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {brand.productCount} productos
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Preview de imagen */}
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {brand.hasImage && brand.imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={brand.imageUrl || "/placeholder.svg"}
                      alt={`Logo de ${brand.nombre}`}
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
                        handleImageUpload(brand.id, file)
                      }
                    }}
                    disabled={uploadingBrand === brand.id}
                    className="hidden"
                    id={`upload-${brand.id}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    disabled={uploadingBrand === brand.id}
                    asChild
                  >
                    <label htmlFor={`upload-${brand.id}`} className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingBrand === brand.id ? "Subiendo..." : "Subir Logo"}
                    </label>
                  </Button>
                </div>

                {brand.hasImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteImage(brand.id)}
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

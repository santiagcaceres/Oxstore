"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Upload, Search, AlertCircle, CheckCircle, Trash2, Eye } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Brand {
  brand: string
  product_count: number
  size_guide_url?: string
}

export default function SizeGuidesPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadBrands()
  }, [])

  useEffect(() => {
    filterBrands()
  }, [brands, searchTerm])

  const loadBrands = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Loading all brands from products_in_stock...")

      // Obtener todas las marcas únicas con conteo de productos
      const { data: productsData, error: productsError } = await supabase
        .from("products_in_stock")
        .select("brand")
        .eq("is_active", true)

      if (productsError) {
        throw new Error(`Error cargando marcas: ${productsError.message}`)
      }

      // Contar productos por marca
      const brandCounts = productsData.reduce(
        (acc, product) => {
          const brand = product.brand || "Sin marca"
          acc[brand] = (acc[brand] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      // Obtener guías de talles existentes
      const { data: guidesData, error: guidesError } = await supabase.from("size_guides").select("brand, image_url")

      if (guidesError) {
        console.error("Error loading size guides:", guidesError)
      }

      // Crear mapa de guías de talles
      const guidesMap = new Map(guidesData?.map((guide) => [guide.brand, guide.image_url]) || [])

      // Combinar datos
      const brandsWithGuides: Brand[] = Object.entries(brandCounts)
        .map(([brand, count]) => ({
          brand,
          product_count: count,
          size_guide_url: guidesMap.get(brand),
        }))
        .sort((a, b) => b.product_count - a.product_count)

      console.log(`[v0] Loaded ${brandsWithGuides.length} brands`)
      setBrands(brandsWithGuides)
    } catch (error) {
      console.error("Error loading brands:", error)
      setError(error instanceof Error ? error.message : "Error cargando marcas")
      setBrands([])
    } finally {
      setLoading(false)
    }
  }

  const filterBrands = () => {
    if (!searchTerm) {
      setFilteredBrands(brands)
      return
    }

    const filtered = brands.filter((brand) => brand.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredBrands(filtered)
  }

  const handleFileUpload = async (brand: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(brand)
      setError(null)
      setSuccess(null)

      console.log(`[v0] Uploading size guide for brand: ${brand}`)

      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        throw new Error("El archivo debe ser una imagen")
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no debe superar los 5MB")
      }

      // Subir imagen a Supabase Storage
      const fileName = `size-guide-${brand.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${file.name.split(".").pop()}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("size-guides")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        throw new Error(`Error subiendo imagen: ${uploadError.message}`)
      }

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("size-guides").getPublicUrl(fileName)

      console.log(`[v0] Image uploaded: ${publicUrl}`)

      // Guardar o actualizar en la base de datos
      const { error: upsertError } = await supabase.from("size_guides").upsert(
        {
          brand,
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "brand",
        },
      )

      if (upsertError) {
        throw new Error(`Error guardando guía de talles: ${upsertError.message}`)
      }

      setSuccess(`Guía de talles actualizada para ${brand}`)
      await loadBrands()

      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error uploading size guide:", error)
      setError(error instanceof Error ? error.message : "Error subiendo guía de talles")
    } finally {
      setUploading(null)
      event.target.value = ""
    }
  }

  const handleDeleteGuide = async (brand: string, imageUrl: string) => {
    if (!confirm(`¿Estás seguro de eliminar la guía de talles de ${brand}?`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      console.log(`[v0] Deleting size guide for brand: ${brand}`)

      // Eliminar de la base de datos
      const { error: deleteError } = await supabase.from("size_guides").delete().eq("brand", brand)

      if (deleteError) {
        throw new Error(`Error eliminando guía: ${deleteError.message}`)
      }

      // Intentar eliminar la imagen del storage (opcional, puede fallar si no existe)
      const fileName = imageUrl.split("/").pop()
      if (fileName) {
        await supabase.storage.from("size-guides").remove([fileName])
      }

      setSuccess(`Guía de talles eliminada para ${brand}`)
      await loadBrands()

      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error deleting size guide:", error)
      setError(error instanceof Error ? error.message : "Error eliminando guía de talles")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guías de Talles</h1>
          <p className="text-muted-foreground">Gestiona las guías de talles para cada marca</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Marcas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con Guía de Talles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{brands.filter((b) => b.size_guide_url).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sin Guía de Talles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{brands.filter((b) => !b.size_guide_url).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Marca</CardTitle>
          <CardDescription>Filtra las marcas por nombre</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Marcas */}
      <Card>
        <CardHeader>
          <CardTitle>Marcas y Guías de Talles</CardTitle>
          <CardDescription>
            {filteredBrands.length} de {brands.length} marcas mostradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <p className="text-muted-foreground">Cargando marcas...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Guía de Talles</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.brand}>
                    <TableCell>
                      <div className="font-medium">{brand.brand}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{brand.product_count} productos</Badge>
                    </TableCell>
                    <TableCell>
                      {brand.size_guide_url ? (
                        <Badge className="bg-green-100 text-green-800">Con guía</Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600">
                          Sin guía
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {brand.size_guide_url && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setPreviewImage(brand.size_guide_url!)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver guía
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Guía de Talles - {brand.brand}</DialogTitle>
                              <DialogDescription>Vista previa de la guía de talles</DialogDescription>
                            </DialogHeader>
                            <div className="relative w-full h-[600px]">
                              <Image
                                src={brand.size_guide_url || "/placeholder.svg"}
                                alt={`Guía de talles ${brand.brand}`}
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <label htmlFor={`upload-${brand.brand}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={uploading === brand.brand}
                            onClick={() => document.getElementById(`upload-${brand.brand}`)?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading === brand.brand ? "Subiendo..." : brand.size_guide_url ? "Cambiar" : "Subir"}
                          </Button>
                          <input
                            id={`upload-${brand.brand}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(brand.brand, e)}
                            disabled={uploading === brand.brand}
                          />
                        </label>
                        {brand.size_guide_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGuide(brand.brand, brand.size_guide_url!)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredBrands.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron marcas que coincidan con la búsqueda." : "No hay marcas disponibles."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

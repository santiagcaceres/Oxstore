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

interface Subcategory {
  subcategory: string
  product_count: number
  size_guide_url?: string
}

export default function SizeGuidesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadSubcategories()
  }, [])

  useEffect(() => {
    filterSubcategories()
  }, [subcategories, searchTerm])

  const loadSubcategories = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Loading all subcategories from products_in_stock...")

      // Obtener todas las subcategorías únicas con conteo de productos
      const { data: productsData, error: productsError } = await supabase
        .from("products_in_stock")
        .select("subcategory")
        .eq("is_active", true)

      if (productsError) {
        throw new Error(`Error cargando subcategorías: ${productsError.message}`)
      }

      // Contar productos por subcategoría
      const subcategoryCounts = productsData.reduce(
        (acc, product) => {
          const subcategory = product.subcategory || "Sin subcategoría"
          acc[subcategory] = (acc[subcategory] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      // Obtener guías de talles existentes
      const { data: guidesData, error: guidesError } = await supabase
        .from("size_guides")
        .select("subcategory, image_url")

      if (guidesError) {
        console.error("Error loading size guides:", guidesError)
      }

      // Crear mapa de guías de talles
      const guidesMap = new Map(guidesData?.map((guide) => [guide.subcategory, guide.image_url]) || [])

      // Combinar datos
      const subcategoriesWithGuides: Subcategory[] = Object.entries(subcategoryCounts)
        .map(([subcategory, count]) => ({
          subcategory,
          product_count: count,
          size_guide_url: guidesMap.get(subcategory),
        }))
        .sort((a, b) => b.product_count - a.product_count)

      console.log(`[v0] Loaded ${subcategoriesWithGuides.length} subcategories`)
      setSubcategories(subcategoriesWithGuides)
    } catch (error) {
      console.error("Error loading subcategories:", error)
      setError(error instanceof Error ? error.message : "Error cargando subcategorías")
      setSubcategories([])
    } finally {
      setLoading(false)
    }
  }

  const filterSubcategories = () => {
    if (!searchTerm) {
      setFilteredSubcategories(subcategories)
      return
    }

    const filtered = subcategories.filter((sub) => sub.subcategory.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredSubcategories(filtered)
  }

  const handleFileUpload = async (subcategory: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(subcategory)
      setError(null)
      setSuccess(null)

      console.log(`[v0] Uploading size guide for subcategory: ${subcategory}`)

      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        throw new Error("El archivo debe ser una imagen")
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no debe superar los 5MB")
      }

      // Subir imagen a Supabase Storage
      const fileName = `size-guide-${subcategory.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${file.name.split(".").pop()}`
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
          subcategory,
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "subcategory",
        },
      )

      if (upsertError) {
        throw new Error(`Error guardando guía de talles: ${upsertError.message}`)
      }

      setSuccess(`Guía de talles actualizada para ${subcategory}`)
      await loadSubcategories()

      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error uploading size guide:", error)
      setError(error instanceof Error ? error.message : "Error subiendo guía de talles")
    } finally {
      setUploading(null)
      event.target.value = ""
    }
  }

  const handleDeleteGuide = async (subcategory: string, imageUrl: string) => {
    if (!confirm(`¿Estás seguro de eliminar la guía de talles de ${subcategory}?`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      console.log(`[v0] Deleting size guide for subcategory: ${subcategory}`)

      // Eliminar de la base de datos
      const { error: deleteError } = await supabase.from("size_guides").delete().eq("subcategory", subcategory)

      if (deleteError) {
        throw new Error(`Error eliminando guía: ${deleteError.message}`)
      }

      // Intentar eliminar la imagen del storage (opcional, puede fallar si no existe)
      const fileName = imageUrl.split("/").pop()
      if (fileName) {
        await supabase.storage.from("size-guides").remove([fileName])
      }

      setSuccess(`Guía de talles eliminada para ${subcategory}`)
      await loadSubcategories()

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
          <p className="text-muted-foreground">Gestiona las guías de talles para cada subcategoría de producto</p>
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
            <CardTitle className="text-sm font-medium">Total de Subcategorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subcategories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con Guía de Talles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {subcategories.filter((s) => s.size_guide_url).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sin Guía de Talles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {subcategories.filter((s) => !s.size_guide_url).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Subcategoría</CardTitle>
          <CardDescription>Filtra las subcategorías por nombre</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar subcategoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Subcategorías */}
      <Card>
        <CardHeader>
          <CardTitle>Subcategorías y Guías de Talles</CardTitle>
          <CardDescription>
            {filteredSubcategories.length} de {subcategories.length} subcategorías mostradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <p className="text-muted-foreground">Cargando subcategorías...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subcategoría</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Guía de Talles</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubcategories.map((subcategory) => (
                  <TableRow key={subcategory.subcategory}>
                    <TableCell>
                      <div className="font-medium capitalize">{subcategory.subcategory}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{subcategory.product_count} productos</Badge>
                    </TableCell>
                    <TableCell>
                      {subcategory.size_guide_url ? (
                        <Badge className="bg-green-100 text-green-800">Con guía</Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600">
                          Sin guía
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {subcategory.size_guide_url && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewImage(subcategory.size_guide_url!)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver guía
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Guía de Talles - {subcategory.subcategory}</DialogTitle>
                              <DialogDescription>Vista previa de la guía de talles</DialogDescription>
                            </DialogHeader>
                            <div className="relative w-full h-[600px]">
                              <Image
                                src={subcategory.size_guide_url || "/placeholder.svg"}
                                alt={`Guía de talles ${subcategory.subcategory}`}
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
                        <label htmlFor={`upload-${subcategory.subcategory}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={uploading === subcategory.subcategory}
                            onClick={() => document.getElementById(`upload-${subcategory.subcategory}`)?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading === subcategory.subcategory
                              ? "Subiendo..."
                              : subcategory.size_guide_url
                                ? "Cambiar"
                                : "Subir"}
                          </Button>
                          <input
                            id={`upload-${subcategory.subcategory}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(subcategory.subcategory, e)}
                            disabled={uploading === subcategory.subcategory}
                          />
                        </label>
                        {subcategory.size_guide_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGuide(subcategory.subcategory, subcategory.size_guide_url!)}
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

          {filteredSubcategories.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron subcategorías que coincidan con la búsqueda."
                  : "No hay subcategorías disponibles."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

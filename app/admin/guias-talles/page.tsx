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
  id: number
  name: string
  slug: string
  category_id: number
  gender: string | null
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

      console.log("[v0] Loading ALL subcategories from subcategories table...")

      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from("subcategories")
        .select("id, name, slug, category_id, gender")
        .eq("is_active", true)
        .order("name")

      if (subcategoriesError) {
        throw new Error(`Error cargando subcategorías: ${subcategoriesError.message}`)
      }

      console.log(`[v0] Loaded ${subcategoriesData?.length || 0} subcategories from database`)

      const { data: productsData, error: productsError } = await supabase
        .from("products_in_stock")
        .select("subcategory")
        .eq("is_active", true)

      if (productsError) {
        console.error("Error loading products:", productsError)
      }

      const productCounts =
        productsData?.reduce(
          (acc, product) => {
            const subcategory = product.subcategory
            if (subcategory) {
              acc[subcategory] = (acc[subcategory] || 0) + 1
            }
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      console.log("[v0] Product counts by subcategory slug:", productCounts)

      const { data: guidesData, error: guidesError } = await supabase
        .from("size_guides")
        .select("subcategory, gender, image_url")

      if (guidesError) {
        console.error("Error loading size guides:", guidesError)
      }

      const guidesMap = new Map(
        guidesData?.map((guide) => [`${guide.subcategory.toLowerCase()}-${guide.gender || "all"}`, guide.image_url]) ||
          [],
      )

      console.log("[v0] Size guides map:", Array.from(guidesMap.entries()))

      const subcategoriesWithData: Subcategory[] = (subcategoriesData || []).map((sub) => {
        const specificGuideKey = `${sub.slug.toLowerCase()}-${sub.gender || "all"}`
        const generalGuideKey = `${sub.slug.toLowerCase()}-all`
        const size_guide_url = guidesMap.get(specificGuideKey) || guidesMap.get(generalGuideKey)

        return {
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          category_id: sub.category_id,
          gender: sub.gender,
          product_count: productCounts[sub.slug] || 0,
          size_guide_url,
        }
      })

      subcategoriesWithData.sort((a, b) => {
        if (b.product_count !== a.product_count) {
          return b.product_count - a.product_count
        }
        return a.name.localeCompare(b.name)
      })

      console.log(`[v0] Final subcategories with data: ${subcategoriesWithData.length}`)
      console.log("[v0] Subcategories with guides:", subcategoriesWithData.filter((s) => s.size_guide_url).length)
      console.log("[v0] Subcategories without guides:", subcategoriesWithData.filter((s) => !s.size_guide_url).length)

      setSubcategories(subcategoriesWithData)
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

    const filtered = subcategories.filter((sub) => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredSubcategories(filtered)
  }

  const handleFileUpload = async (
    subcategorySlug: string,
    subcategoryGender: string | null,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const uploadGender = subcategoryGender

    try {
      setUploading(subcategorySlug)
      setError(null)
      setSuccess(null)

      console.log(`[v0] Uploading size guide for subcategory: ${subcategorySlug}, gender: ${uploadGender}`)

      if (!file.type.startsWith("image/")) {
        throw new Error("El archivo debe ser una imagen")
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no debe superar los 5MB")
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("subcategorySlug", subcategorySlug)
      if (uploadGender) {
        formData.append("gender", uploadGender)
      }

      const response = await fetch("/api/size-guides/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error subiendo guía de talles")
      }

      console.log(`[v0] Image uploaded successfully: ${result.imageUrl}`)

      const subcategoryName = subcategories.find((s) => s.slug === subcategorySlug)?.name || subcategorySlug
      const genderText = uploadGender || "todas las categorías"
      setSuccess(`Guía de talles actualizada para ${subcategoryName} (${genderText})`)
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

  const handleDeleteGuide = async (subcategorySlug: string, subcategoryGender: string | null, imageUrl: string) => {
    const subcategoryName = subcategories.find((s) => s.slug === subcategorySlug)?.name || subcategorySlug
    const genderText = subcategoryGender || "todas las categorías"
    if (!confirm(`¿Estás seguro de eliminar la guía de talles de ${subcategoryName} (${genderText})?`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      console.log(`[v0] Deleting size guide for subcategory: ${subcategorySlug}, gender: ${subcategoryGender}`)

      const { error: deleteError } = await supabase
        .from("size_guides")
        .delete()
        .eq("subcategory", subcategorySlug)
        .eq("gender", subcategoryGender)

      if (deleteError) {
        throw new Error(`Error eliminando guía: ${deleteError.message}`)
      }

      const fileName = imageUrl.split("/").pop()
      if (fileName) {
        await supabase.storage.from("size-guides").remove([fileName])
      }

      setSuccess(`Guía de talles eliminada para ${subcategoryName} (${genderText})`)
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
          <p className="text-muted-foreground">Gestiona las guías de talles para cada subcategoría y género</p>
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
                  <TableHead>Género</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Guía de Talles</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubcategories.map((subcategory) => (
                  <TableRow key={subcategory.id}>
                    <TableCell>
                      <div className="font-medium capitalize">{subcategory.name}</div>
                      <div className="text-xs text-muted-foreground">{subcategory.slug}</div>
                    </TableCell>
                    <TableCell>
                      {subcategory.gender ? (
                        <Badge variant="outline" className="capitalize">
                          {subcategory.gender}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {subcategory.product_count} {subcategory.product_count === 1 ? "producto" : "productos"}
                      </Badge>
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
                              <DialogTitle>Guía de Talles - {subcategory.name}</DialogTitle>
                              <DialogDescription>Vista previa de la guía de talles</DialogDescription>
                            </DialogHeader>
                            <div className="relative w-full h-[600px]">
                              <Image
                                src={subcategory.size_guide_url || "/placeholder.svg"}
                                alt={`Guía de talles ${subcategory.name}`}
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
                        <label htmlFor={`upload-${subcategory.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={uploading === subcategory.slug}
                            onClick={() => document.getElementById(`upload-${subcategory.id}`)?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading === subcategory.slug
                              ? "Subiendo..."
                              : subcategory.size_guide_url
                                ? "Cambiar"
                                : "Subir"}
                          </Button>
                          <input
                            id={`upload-${subcategory.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(subcategory.slug, subcategory.gender, e)}
                            disabled={uploading === subcategory.slug}
                          />
                        </label>
                        {subcategory.size_guide_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteGuide(subcategory.slug, subcategory.gender, subcategory.size_guide_url!)
                            }
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

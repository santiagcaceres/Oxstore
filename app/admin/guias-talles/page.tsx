"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Popup } from "@/components/ui/popup"
import { createClient } from "@/lib/supabase/client"
import { Upload, Search, Eye } from "lucide-react"
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

interface Brand {
  id: number
  name: string
  slug: string
  product_count: number
  size_guide_url?: string
}

export default function SizeGuidesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"subcategories" | "brands">("subcategories")
  const [popup, setPopup] = useState<{
    isOpen: boolean
    type: "success" | "error"
    title: string
    message: string
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadSubcategories()
    loadBrands()
  }, [])

  useEffect(() => {
    filterSubcategories()
    filterBrands()
  }, [subcategories, brands, searchTerm])

  const loadSubcategories = async () => {
    try {
      setLoading(true)
      setPopup({ ...popup, isOpen: false })

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
      setPopup({
        isOpen: true,
        type: "error",
        title: "Error al cargar subcategorías",
        message: error instanceof Error ? error.message : "Error cargando subcategorías",
      })
      setSubcategories([])
    } finally {
      setLoading(false)
    }
  }

  const loadBrands = async () => {
    try {
      console.log("[v0] Loading brands from database...")

      const { data: brandsData, error: brandsError } = await supabase
        .from("brands")
        .select("id, name, slug")
        .order("name")

      if (brandsError) {
        throw new Error(`Error cargando marcas: ${brandsError.message}`)
      }

      console.log(`[v0] Loaded ${brandsData?.length || 0} brands from database`)

      // Contar productos por marca
      const { data: productsData, error: productsError } = await supabase
        .from("products_in_stock")
        .select("brand")
        .eq("is_active", true)

      if (productsError) {
        console.error("Error loading products:", productsError)
      }

      const productCounts =
        productsData?.reduce(
          (acc, product) => {
            const brand = product.brand
            if (brand) {
              acc[brand] = (acc[brand] || 0) + 1
            }
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      // Cargar guías de talles por marca
      const { data: guidesData, error: guidesError } = await supabase
        .from("size_guides")
        .select("brand, image_url")
        .not("brand", "is", null)

      if (guidesError) {
        console.error("Error loading brand size guides:", guidesError)
      }

      const guidesMap = new Map(guidesData?.map((guide) => [guide.brand, guide.image_url]) || [])

      const brandsWithData: Brand[] = (brandsData || []).map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        product_count: productCounts[brand.name] || 0,
        size_guide_url: guidesMap.get(brand.name),
      }))

      // Ordenar por cantidad de productos
      brandsWithData.sort((a, b) => {
        if (b.product_count !== a.product_count) {
          return b.product_count - a.product_count
        }
        return a.name.localeCompare(b.name)
      })

      console.log(`[v0] Final brands with data: ${brandsWithData.length}`)
      console.log("[v0] Brands with guides:", brandsWithData.filter((b) => b.size_guide_url).length)

      setBrands(brandsWithData)
    } catch (error) {
      console.error("Error loading brands:", error)
      setPopup({
        isOpen: true,
        type: "error",
        title: "Error al cargar marcas",
        message: error instanceof Error ? error.message : "Error cargando marcas",
      })
      setBrands([])
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

  const filterBrands = () => {
    if (!searchTerm) {
      setFilteredBrands(brands)
      return
    }

    const filtered = brands.filter((brand) => brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredBrands(filtered)
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

      setPopup({
        isOpen: true,
        type: "success",
        title: "¡Guía actualizada!",
        message: `La guía de talles para ${subcategoryName} (${genderText}) se ha actualizado correctamente.`,
      })

      await loadSubcategories()
    } catch (error) {
      console.error("Error uploading size guide:", error)

      setPopup({
        isOpen: true,
        type: "error",
        title: "Error al subir guía",
        message: error instanceof Error ? error.message : "Error subiendo guía de talles",
      })
    } finally {
      setUploading(null)
      event.target.value = ""
    }
  }

  const handleBrandFileUpload = async (brandName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(brandName)

      console.log(`[v0] Uploading size guide for brand: ${brandName}`)

      if (!file.type.startsWith("image/")) {
        throw new Error("El archivo debe ser una imagen")
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no debe superar los 5MB")
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("brandName", brandName)

      const response = await fetch("/api/size-guides/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error subiendo guía de talles")
      }

      console.log(`[v0] Brand size guide uploaded successfully: ${result.imageUrl}`)

      setPopup({
        isOpen: true,
        type: "success",
        title: "¡Guía actualizada!",
        message: `La guía de talles para la marca ${brandName} se ha actualizado correctamente.`,
      })

      await loadBrands()
    } catch (error) {
      console.error("Error uploading brand size guide:", error)

      setPopup({
        isOpen: true,
        type: "error",
        title: "Error al subir guía",
        message: error instanceof Error ? error.message : "Error subiendo guía de talles",
      })
    } finally {
      setUploading(null)
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guías de Talles</h1>
          <p className="text-muted-foreground">Gestiona las guías de talles por marca o subcategoría</p>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("subcategories")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "subcategories"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Por Subcategoría
        </button>
        <button
          onClick={() => setActiveTab("brands")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "brands"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Por Marca
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {activeTab === "subcategories" ? "Total de Subcategorías" : "Total de Marcas"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeTab === "subcategories" ? subcategories.length : brands.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con Guía de Talles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeTab === "subcategories"
                ? subcategories.filter((s) => s.size_guide_url).length
                : brands.filter((b) => b.size_guide_url).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sin Guía de Talles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {activeTab === "subcategories"
                ? subcategories.filter((s) => !s.size_guide_url).length
                : brands.filter((b) => !b.size_guide_url).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar {activeTab === "subcategories" ? "Subcategoría" : "Marca"}</CardTitle>
          <CardDescription>
            Filtra {activeTab === "subcategories" ? "las subcategorías" : "las marcas"} por nombre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder={`Buscar ${activeTab === "subcategories" ? "subcategoría" : "marca"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {activeTab === "subcategories" ? (
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
      ) : (
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
                    <TableRow key={brand.id}>
                      <TableCell>
                        <div className="font-medium">{brand.name}</div>
                        <div className="text-xs text-muted-foreground">{brand.slug}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {brand.product_count} {brand.product_count === 1 ? "producto" : "productos"}
                        </Badge>
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
                                <DialogTitle>Guía de Talles - {brand.name}</DialogTitle>
                                <DialogDescription>Vista previa de la guía de talles</DialogDescription>
                              </DialogHeader>
                              <div className="relative w-full h-[600px]">
                                <Image
                                  src={brand.size_guide_url || "/placeholder.svg"}
                                  alt={`Guía de talles ${brand.name}`}
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
                          <label htmlFor={`upload-brand-${brand.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={uploading === brand.name}
                              onClick={() => document.getElementById(`upload-brand-${brand.id}`)?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploading === brand.name ? "Subiendo..." : brand.size_guide_url ? "Cambiar" : "Subir"}
                            </Button>
                            <input
                              id={`upload-brand-${brand.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleBrandFileUpload(brand.name, e)}
                              disabled={uploading === brand.name}
                            />
                          </label>
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
                  {searchTerm
                    ? "No se encontraron marcas que coincidan con la búsqueda."
                    : "No hay marcas disponibles."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

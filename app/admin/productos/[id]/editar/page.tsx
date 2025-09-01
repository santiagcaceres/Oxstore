"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Save, ArrowLeft, AlertCircle } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface Product {
  id: number
  zureo_id: number
  zureo_code: string
  name: string
  description: string
  price: number
  stock_quantity: number
  category: string
  brand: string
  image_url: string
  is_featured: boolean
  zureo_data: string
  created_at: string
  updated_at: string
}

interface Brand {
  id: number
  name: string
  slug: string
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customName, setCustomName] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [customImage, setCustomImage] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [uploading, setUploading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    loadProduct()
    loadBrands()
    loadCategories()
  }, [params.id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${params.id}`)

      if (!response.ok) {
        throw new Error("Producto no encontrado")
      }

      const data = await response.json()
      const prod = data.product

      setProduct(prod)
      setCustomName(prod.name || "")
      setCustomDescription(prod.description || "")
      setCustomPrice(prod.price?.toString() || "")
      setCustomImage(prod.image_url || "")
      setSelectedBrand(prod.brand || "")
      setSelectedCategory(prod.category || "")
      setIsFeatured(prod.is_featured || false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const loadBrands = async () => {
    try {
      const { data, error } = await supabase.from("brands").select("*").order("name")

      if (error) throw error
      setBrands(data || [])
    } catch (error) {
      console.error("Error cargando marcas:", error)
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error cargando categorías:", error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage.from("banners").upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("banners").getPublicUrl(filePath)

      setCustomImage(data.publicUrl)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al subir imagen")
    } finally {
      setUploading(false)
    }
  }

  const saveChanges = async () => {
    if (!product) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/products/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custom_name: customName,
          local_description: customDescription || null,
          local_price: customPrice ? Number.parseFloat(customPrice) : null,
          local_images: customImage ? [customImage] : [],
          is_featured: isFeatured,
          brand: selectedBrand,
          category: selectedCategory,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar cambios")
      }

      router.push("/admin/productos")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  const zureoData = product?.zureo_data ? JSON.parse(product.zureo_data) : null
  const originalProduct = zureoData?.originalProduct

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Producto no encontrado</h2>
        <p className="text-muted-foreground mb-4">El producto que buscas no existe o no está disponible.</p>
        <Button onClick={() => router.push("/admin/productos")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a productos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/productos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Producto</h1>
            <p className="text-muted-foreground">Personaliza nombre, descripción, precio e imagen</p>
          </div>
        </div>
        <Button onClick={saveChanges} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de Zureo (Solo lectura) */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Zureo</CardTitle>
            <CardDescription>Datos sincronizados desde el sistema Zureo (solo lectura)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Código</Label>
              <p className="font-mono">{product.zureo_code}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nombre Original</Label>
              <p>{originalProduct?.nombre || product.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Precio Zureo</Label>
                <p className="text-lg font-semibold">${originalProduct?.precio || product.price}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Stock</Label>
                <Badge
                  variant={
                    product.stock_quantity > 5 ? "default" : product.stock_quantity > 0 ? "secondary" : "destructive"
                  }
                >
                  {product.stock_quantity} unidades
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración Local */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Personalizada</CardTitle>
            <CardDescription>Personaliza la presentación en tu tienda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="custom-name">Nombre personalizado</Label>
              <Input
                id="custom-name"
                placeholder="Nombre para mostrar en la tienda"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="custom-description">Descripción personalizada</Label>
              <Textarea
                id="custom-description"
                placeholder="Descripción adicional para tu tienda"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="custom-price">Precio personalizado</Label>
              <Input
                id="custom-price"
                type="number"
                step="0.01"
                placeholder={`Precio actual: $${product.price}`}
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.name}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              <Label htmlFor="featured">Producto destacado</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de Imagen */}
      <Card>
        <CardHeader>
          <CardTitle>Imagen del Producto</CardTitle>
          <CardDescription>Sube una imagen personalizada para mostrar en tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customImage && (
              <div className="relative w-48 h-48 mx-auto">
                <Image
                  src={customImage || "/placeholder.svg"}
                  alt="Imagen del producto"
                  fill
                  className="object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setCustomImage("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Subiendo imagen..." : "Haz clic para subir imagen"}
                  </p>
                </div>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

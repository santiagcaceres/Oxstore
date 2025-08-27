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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Save, ArrowLeft, AlertCircle } from "lucide-react"

interface ZureoProduct {
  id: number
  codigo: string
  descripcion: string
  marca: string
  rubro: string
  precio: number
  stock: number
  activo: boolean
  local_images?: string[]
  local_description?: string
  local_price?: number
  is_featured?: boolean
  slug?: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<ZureoProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localImages, setLocalImages] = useState<string[]>([])
  const [localDescription, setLocalDescription] = useState("")
  const [localPrice, setLocalPrice] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/zureo/products/${params.id}`)

      if (!response.ok) {
        throw new Error("Producto no encontrado")
      }

      const data = await response.json()
      setProduct(data.product)
      setLocalImages(data.product.local_images || [])
      setLocalDescription(data.product.local_description || "")
      setLocalPrice(data.product.local_price?.toString() || "")
      setIsFeatured(data.product.is_featured || false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLocalImages((prev) => [...prev, result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setLocalImages((prev) => prev.filter((_, i) => i !== index))
  }

  const saveChanges = async () => {
    if (!product) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/zureo/products/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          local_images: localImages,
          local_description: localDescription || null,
          local_price: localPrice ? Number.parseFloat(localPrice) : null,
          is_featured: isFeatured,
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
            <p className="text-muted-foreground">Personaliza imágenes y configuración local</p>
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
              <p className="font-mono">{product.codigo}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
              <p>{product.descripcion}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Marca</Label>
                <p>{product.marca}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Rubro</Label>
                <p>{product.rubro}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Precio Zureo</Label>
                <p className="text-lg font-semibold">${product.precio}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Stock</Label>
                <Badge variant={product.stock > 5 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                  {product.stock} unidades
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
              <Badge variant={product.activo ? "default" : "secondary"}>{product.activo ? "Activo" : "Inactivo"}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Configuración Local */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Local</CardTitle>
            <CardDescription>Personaliza la presentación en tu tienda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="local-description">Descripción personalizada</Label>
              <Textarea
                id="local-description"
                placeholder="Descripción adicional para tu tienda (opcional)"
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="local-price">Precio personalizado</Label>
              <Input
                id="local-price"
                type="number"
                step="0.01"
                placeholder={`Precio actual: $${product.precio}`}
                value={localPrice}
                onChange={(e) => setLocalPrice(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              <Label htmlFor="featured">Producto destacado</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de Imágenes */}
      <Card>
        <CardHeader>
          <CardTitle>Imágenes del Producto</CardTitle>
          <CardDescription>Sube imágenes para mostrar en tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Haz clic para subir imágenes o arrastra y suelta</p>
                </div>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {localImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {localImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Imagen ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

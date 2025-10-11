"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { createArtwork } from "@/app/actions/artworks"
import { SuccessPopup } from "@/components/success-popup"
import { MultipleImageUpload } from "@/components/multiple-image-upload"
import { Checkbox } from "@/components/ui/checkbox"

export default function NuevaObraPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Validar que hay al menos una imagen
      if (images.length === 0) {
        setError("Debes agregar al menos una imagen")
        setIsSubmitting(false)
        return
      }

      // Agregar todas las imágenes al FormData
      images.forEach((image) => {
        formData.append("images", image)
      })

      await createArtwork(formData)
      setShowSuccess(true)

      // Esperar un poco para que el usuario vea el popup y luego redirigir
      setTimeout(() => {
        router.push("/admin/obras")
      }, 2000)
    } catch (error) {
      console.error("Error creating artwork:", error)
      setError(error instanceof Error ? error.message : "Error al crear la obra")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/obras">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Nueva Obra</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Información de la Obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Imágenes */}
              <div>
                <Label>Imágenes de la Obra *</Label>
                <p className="text-sm text-gray-500 mb-2">
                  La primera imagen será la imagen principal. Puedes agregar múltiples imágenes.
                </p>
                <MultipleImageUpload images={images} setImages={setImages} />
              </div>

              {/* Título */}
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input id="title" name="title" required placeholder="Ej: Retrato de la Vulnerabilidad" />
              </div>

              {/* Categoría */}
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oleos">Óleos</SelectItem>
                    <SelectItem value="oleo-pastel">Óleo Pastel</SelectItem>
                    <SelectItem value="acrilicos">Acrílicos</SelectItem>
                    <SelectItem value="tecnica-mixta">Técnica Mixta</SelectItem>
                    <SelectItem value="acuarelas">Acuarelas</SelectItem>
                    <SelectItem value="dibujos">Dibujos</SelectItem>
                    <SelectItem value="esculturas">Esculturas</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategoría (opcional) */}
              <div>
                <Label htmlFor="subcategory">Subcategoría</Label>
                <Input id="subcategory" name="subcategory" placeholder="Ej: Espátula, Pincel, etc." />
              </div>

              {/* Precio */}
              <div>
                <Label htmlFor="price">Precio (USD) *</Label>
                <Input id="price" name="price" type="number" required placeholder="1500" min="0" step="0.01" />
              </div>

              {/* Descripción Corta */}
              <div>
                <Label htmlFor="description">Descripción Corta *</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  placeholder="Breve descripción de la obra"
                  rows={3}
                />
              </div>

              {/* Descripción Detallada */}
              <div>
                <Label htmlFor="detailedDescription">Descripción Detallada</Label>
                <Textarea
                  id="detailedDescription"
                  name="detailedDescription"
                  placeholder="Descripción completa de la obra, su significado, técnica, inspiración..."
                  rows={6}
                />
              </div>

              {/* Año */}
              <div>
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  placeholder={new Date().getFullYear().toString()}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              {/* Dimensiones */}
              <div>
                <Label htmlFor="dimensions">Dimensiones</Label>
                <Input id="dimensions" name="dimensions" placeholder="Ej: 60 x 80 cm" />
              </div>

              {/* Técnica */}
              <div>
                <Label htmlFor="technique">Técnica</Label>
                <Input id="technique" name="technique" placeholder="Ej: Óleo sobre lienzo" />
              </div>

              {/* Estado */}
              <div>
                <Label htmlFor="status">Estado *</Label>
                <Select name="status" required defaultValue="Disponible">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disponible">Disponible</SelectItem>
                    <SelectItem value="Vendida">Vendida</SelectItem>
                    <SelectItem value="No disponible">No disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Destacada */}
              <div className="flex items-center space-x-2">
                <Checkbox id="featured" name="featured" />
                <Label htmlFor="featured" className="cursor-pointer">
                  Marcar como obra destacada (aparecerá en la página principal)
                </Label>
              </div>

              {/* Error */}
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Obra"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>

      {/* Success Popup */}
      {showSuccess && <SuccessPopup message="¡Obra creada exitosamente!" onClose={() => router.push("/admin/obras")} />}
    </div>
  )
}

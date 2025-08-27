"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, Eye } from "lucide-react"
import Link from "next/link"

export default function NewBannerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    mobile_image_url: "",
    link_url: "",
    button_text: "",
    position: "hero",
    is_active: true,
    sort_order: 1,
    start_date: "",
    end_date: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/banners")
      } else {
        setError("Error al crear el banner")
      }
    } catch (error) {
      setError("Error al crear el banner")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/banners">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Crear Nuevo Banner</h1>
          <p className="text-muted-foreground">Crea un nuevo banner promocional para tu tienda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Banner</CardTitle>
              <CardDescription>Completa los datos del nuevo banner</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Título del banner"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Posición *</Label>
                      <Select value={formData.position} onValueChange={(value) => handleInputChange("position", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero">Hero Principal</SelectItem>
                          <SelectItem value="secondary">Secundario</SelectItem>
                          <SelectItem value="sidebar">Barra lateral</SelectItem>
                          <SelectItem value="footer">Pie de página</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtítulo</Label>
                    <Textarea
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange("subtitle", e.target.value)}
                      placeholder="Subtítulo o descripción del banner"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Imágenes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Imagen Principal *</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="image_url"
                          value={formData.image_url}
                          onChange={(e) => handleInputChange("image_url", e.target.value)}
                          placeholder="URL de la imagen"
                          required
                        />
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile_image_url">Imagen Móvil</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="mobile_image_url"
                          value={formData.mobile_image_url}
                          onChange={(e) => handleInputChange("mobile_image_url", e.target.value)}
                          placeholder="URL de la imagen móvil (opcional)"
                        />
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Acción</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="link_url">URL de Destino</Label>
                      <Input
                        id="link_url"
                        value={formData.link_url}
                        onChange={(e) => handleInputChange("link_url", e.target.value)}
                        placeholder="/categoria/ofertas"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="button_text">Texto del Botón</Label>
                      <Input
                        id="button_text"
                        value={formData.button_text}
                        onChange={(e) => handleInputChange("button_text", e.target.value)}
                        placeholder="Ver Ofertas"
                      />
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuración</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sort_order">Orden</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => handleInputChange("sort_order", Number.parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Fecha de Inicio</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange("start_date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Fecha de Fin</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => handleInputChange("end_date", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                    />
                    <Label htmlFor="is_active">Banner activo</Label>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creando..." : "Crear Banner"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/admin/banners">Cancelar</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Vista Previa</span>
              </CardTitle>
              <CardDescription>Cómo se verá tu banner</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.image_url ? (
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                    <img
                      src={formData.image_url || "/placeholder.svg"}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                    {formData.title && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center text-white p-4">
                        <div>
                          <h3 className="font-bold text-lg mb-2">{formData.title}</h3>
                          {formData.subtitle && <p className="text-sm mb-3">{formData.subtitle}</p>}
                          {formData.button_text && (
                            <div className="inline-block bg-white text-black px-4 py-2 rounded text-sm font-medium">
                              {formData.button_text}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Vista previa del banner</p>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posición:</span>
                    <span className="capitalize">{formData.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className={formData.is_active ? "text-green-600" : "text-red-600"}>
                      {formData.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Orden:</span>
                    <span>{formData.sort_order}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

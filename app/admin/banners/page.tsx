"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Trash2, ImageIcon, Eye, EyeOff, ArrowUp, ArrowDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Banner {
  id: string
  title: string
  description: string
  imageUrl: string
  link: string
  position: "hero" | "secondary" | "footer"
  active: boolean
  order: number
  createdAt: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    position: "hero" as const,
    active: true,
    order: 1,
  })

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      const response = await fetch("/api/banners")
      const data = await response.json()
      setBanners(data)
    } catch (error) {
      console.error("Error loading banners:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", "banners")

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Error uploading file")
    }

    const data = await response.json()
    return data.url
  }

  const handleCreateBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (!file) {
      alert("Por favor selecciona una imagen")
      return
    }

    setUploading(true)

    try {
      const imageUrl = await handleFileUpload(file)

      const response = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl,
        }),
      })

      if (response.ok) {
        await loadBanners()
        setShowForm(false)
        setFormData({
          title: "",
          description: "",
          link: "",
          position: "hero",
          active: true,
          order: 1,
        })
        alert("Banner creado exitosamente")
      }
    } catch (error) {
      console.error("Error creating banner:", error)
      alert("Error al crear el banner")
    } finally {
      setUploading(false)
    }
  }

  const moveBanner = async (index: number, direction: "up" | "down") => {
    const newBanners = [...banners]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < banners.length) {
      // Intercambiar banners
      ;[newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]]

      // Actualizar el orden
      newBanners.forEach((banner, i) => {
        banner.order = i + 1
      })

      setBanners(newBanners)

      // Actualizar en el servidor
      try {
        await fetch("/api/banners/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ banners: newBanners }),
        })
      } catch (error) {
        console.error("Error reordering banners:", error)
        // Revertir cambios si falla
        loadBanners()
      }
    }
  }

  const toggleBannerStatus = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !banner.active }),
      })

      if (response.ok) {
        setBanners(banners.map((b) => (b.id === banner.id ? { ...b, active: !b.active } : b)))
      }
    } catch (error) {
      console.error("Error updating banner:", error)
    }
  }

  const handleDeleteBanner = async (banner: Banner) => {
    if (banners.length <= 1) {
      alert("Debe haber al menos un banner. No se puede eliminar.")
      return
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este banner?")) return

    try {
      const response = await fetch(`/api/banners/${banner.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBanners(banners.filter((b) => b.id !== banner.id))
        alert("Banner eliminado exitosamente")
      }
    } catch (error) {
      console.error("Error deleting banner:", error)
      alert("Error al eliminar el banner.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Cargando banners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Banners</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancelar" : "Crear Banner"}</Button>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            Información sobre Imágenes del Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <p>
            <strong>Subida de archivos locales:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <strong>Formatos aceptados:</strong> JPG, PNG, WebP
            </li>
            <li>
              <strong>Tamaño máximo:</strong> 15MB por imagen
            </li>
            <li>
              <strong>Resolución recomendada:</strong> 1920x1080 píxeles (formato panorámico)
            </li>
            <li>
              <strong>Uso:</strong> Estas imágenes se mostrarán como fondo del banner principal
            </li>
          </ul>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Banner</CardTitle>
            <CardDescription>
              Gestiona los banners que aparecen en diferentes secciones de la tienda. Puedes agregar, editar y reordenar
              banners.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título del banner"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="link">Enlace *</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/categoria o URL externa"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del banner"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="position">Posición</Label>
                  <select
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="hero">Hero Principal</option>
                    <option value="secondary">Secundario</option>
                    <option value="footer">Footer</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="order">Orden</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number.parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label>Activo</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="image">Imagen del Banner</Label>
                <Input id="image" type="file" accept="image/*" required className="file:mr-4 file:py-2 file:px-4" />
              </div>

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? "Subiendo..." : "Crear Banner"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {banners.map((banner, index) => (
          <Card key={banner.id} className="border-2 border-dashed border-gray-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg">Banner {index + 1}</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => moveBanner(index, "up")} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveBanner(index, "down")}
                    disabled={index === banners.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBannerStatus(banner)}
                    className={banner.active ? "text-orange-600" : "text-green-600"}
                  >
                    {banner.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteBanner(banner)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{banner.title}</h3>
                    {banner.description && <p className="text-sm text-gray-600 mt-1">{banner.description}</p>}
                    <div className="flex gap-2 mt-2">
                      <Badge variant={banner.active ? "default" : "secondary"}>
                        {banner.active ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline">{banner.position}</Badge>
                      <Badge variant="outline">Orden: {banner.order}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Enlace: {banner.link}</p>
                    <p className="text-xs text-gray-400">Creado: {new Date(banner.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <Image src={banner.imageUrl || "/placeholder.svg"} alt={banner.title} fill className="object-cover" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No hay banners creados</p>
          <p className="text-sm text-gray-400 mt-2">Crea tu primer banner usando el botón de arriba</p>
        </div>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Trash2, ImageIcon, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

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
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
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
      }
    } catch (error) {
      console.error("Error creating banner:", error)
      alert("Error al crear el banner")
    } finally {
      setUploading(false)
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
    if (!confirm("¿Estás seguro de que quieres eliminar este banner?")) return

    try {
      const response = await fetch(`/api/banners/${banner.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBanners(banners.filter((b) => b.id !== banner.id))
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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título del banner"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Enlace</label>
                  <Input
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/categoria o URL externa"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del banner"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Posición</label>
                  <select
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
                  <label className="block text-sm font-medium mb-2">Orden</label>
                  <Input
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
                  <label className="text-sm font-medium">Activo</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Imagen del Banner</label>
                <Input type="file" accept="image/*" required className="file:mr-4 file:py-2 file:px-4" />
              </div>

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? "Subiendo..." : "Crear Banner"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image src={banner.imageUrl || "/placeholder.svg"} alt={banner.title} fill className="object-cover" />
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge variant={banner.active ? "default" : "secondary"}>{banner.active ? "Activo" : "Inactivo"}</Badge>
                <Badge variant="outline">{banner.position}</Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{banner.title}</h3>
                {banner.description && <p className="text-sm text-gray-600">{banner.description}</p>}
                <p className="text-xs text-gray-500">Enlace: {banner.link}</p>
                <p className="text-xs text-gray-400">Creado: {new Date(banner.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBannerStatus(banner)}
                    className={banner.active ? "text-orange-600" : "text-green-600"}
                  >
                    {banner.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteBanner(banner)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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

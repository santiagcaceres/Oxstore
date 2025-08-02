"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Banner {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  linkUrl: string
  position: "hero" | "promotional"
  active: boolean
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: "1",
      title: "Nueva Colección Verano",
      subtitle: "Descubre los últimos estilos",
      imageUrl: "/placeholder.svg?height=400&width=800&text=Banner+Verano",
      linkUrl: "/verano",
      position: "hero",
      active: true,
    },
    {
      id: "2",
      title: "Ofertas Especiales",
      subtitle: "Hasta 50% de descuento",
      imageUrl: "/placeholder.svg?height=200&width=1200&text=Banner+Ofertas",
      linkUrl: "/ofertas",
      position: "promotional",
      active: true,
    },
  ])

  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSaveBanner = (banner: Banner) => {
    if (editingBanner) {
      setBanners(banners.map((b) => (b.id === banner.id ? banner : b)))
    } else {
      setBanners([...banners, { ...banner, id: Date.now().toString() }])
    }
    setEditingBanner(null)
    setIsDialogOpen(false)
  }

  const handleDeleteBanner = (id: string) => {
    setBanners(banners.filter((b) => b.id !== id))
  }

  const toggleBannerStatus = (id: string) => {
    setBanners(banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b)))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Banners</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-950 hover:bg-blue-900" onClick={() => setEditingBanner(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingBanner ? "Editar Banner" : "Nuevo Banner"}</DialogTitle>
            </DialogHeader>
            <BannerForm banner={editingBanner} onSave={handleSaveBanner} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{banner.title}</h3>
                <p className="text-gray-600">{banner.subtitle}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      banner.position === "hero" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {banner.position === "hero" ? "Hero Slider" : "Banner Promocional"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      banner.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {banner.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => toggleBannerStatus(banner.id)}>
                  {banner.active ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingBanner(banner)
                    setIsDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
              <Image src={banner.imageUrl || "/placeholder.svg"} alt={banner.title} fill className="object-cover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BannerForm({
  banner,
  onSave,
  onCancel,
}: {
  banner: Banner | null
  onSave: (banner: Banner) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Banner>(
    banner || {
      id: "",
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      position: "hero",
      active: true,
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Subtítulo</Label>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">URL de la Imagen</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://ejemplo.com/imagen.jpg"
          required
        />
      </div>

      <div>
        <Label htmlFor="linkUrl">URL de Destino</Label>
        <Input
          id="linkUrl"
          value={formData.linkUrl}
          onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
          placeholder="/categoria"
          required
        />
      </div>

      <div>
        <Label htmlFor="position">Posición</Label>
        <select
          id="position"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value as "hero" | "promotional" })}
          className="w-full p-2 border rounded-md"
        >
          <option value="hero">Hero Slider</option>
          <option value="promotional">Banner Promocional</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-950 hover:bg-blue-900">
          Guardar
        </Button>
      </div>
    </form>
  )
}

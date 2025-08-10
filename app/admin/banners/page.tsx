"use client"

import type React from "react"

import { useState, type ChangeEvent } from "react"
import Image from "next/image"
import { Edit, Trash2, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

interface Banner {
  id: string
  title: string
  imageUrl: string
  linkUrl: string
  active: boolean
}

// Mock de datos iniciales
const initialBanners: Banner[] = [
  {
    id: "1",
    title: "Nueva Colección",
    imageUrl: "/placeholder.svg?height=400&width=1200&text=Banner+1",
    linkUrl: "/nuevo",
    active: true,
  },
]

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Banners</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBanner(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Banner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBanner ? "Editar Banner" : "Nuevo Banner"}</DialogTitle>
            </DialogHeader>
            <BannerForm banner={editingBanner} onSave={handleSaveBanner} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-32 bg-gray-100 rounded-md overflow-hidden">
                <Image src={banner.imageUrl || "/placeholder.svg"} alt={banner.title} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-semibold">{banner.title}</h3>
                <a
                  href={banner.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {banner.linkUrl}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor={`active-${banner.id}`}>{banner.active ? "Activo" : "Inactivo"}</Label>
                <Switch
                  id={`active-${banner.id}`}
                  checked={banner.active}
                  onCheckedChange={(checked) =>
                    setBanners(banners.map((b) => (b.id === banner.id ? { ...b, active: checked } : b)))
                  }
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setEditingBanner(banner)
                  setIsDialogOpen(true)
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => handleDeleteBanner(banner.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
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
  const [formData, setFormData] = useState<Omit<Banner, "id">>(
    banner || { title: "", imageUrl: "", linkUrl: "", active: true },
  )
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const body = new FormData()
    body.append("file", file)
    body.append("type", "banner")

    try {
      const response = await fetch("/api/upload-image", { method: "POST", body })
      const { url } = await response.json()
      setFormData({ ...formData, imageUrl: url })
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      alert("Error al subir la imagen.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: banner?.id || "" })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título del Banner</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="linkUrl">URL de Destino</Label>
        <Input
          id="linkUrl"
          value={formData.linkUrl}
          onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
          placeholder="/categoria/producto"
          required
        />
      </div>
      <div>
        <Label htmlFor="image">Imagen del Banner</Label>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-40 bg-gray-100 rounded-md overflow-hidden">
            {formData.imageUrl && (
              <Image src={formData.imageUrl || "/placeholder.svg"} alt="Vista previa" fill className="object-cover" />
            )}
          </div>
          <Button type="button" asChild variant="outline">
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Subiendo..." : "Subir Archivo"}
            </label>
          </Button>
          <input
            id="image-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isUploading}
          />
        </div>
        {isUploading && <p className="text-sm text-gray-500 mt-2">La imagen se está procesando...</p>}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isUploading}>
          Guardar Banner
        </Button>
      </div>
    </form>
  )
}

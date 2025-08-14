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
import { supabase } from "@/lib/supabase/client"

interface Banner {
  id: string
  title: string
  description: string
  image_url: string
  link_url: string
  display_order: number
  is_active: boolean
  created_at: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link_url: "",
    is_active: true,
    display_order: 1,
  })

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      if (!supabase) return

      const { data, error } = await supabase.from("banners").select("*").order("display_order", { ascending: true })

      if (error) throw error
      setBanners(data || [])
    } catch (error) {
      console.error("Error loading banners:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!supabase) throw new Error("Supabase no está configurado")

    const fileExt = file.name.split(".").pop()
    const fileName = `banner-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage.from("images").upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName)

    return { url: urlData.publicUrl, filePath: fileName }
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
      const { url: imageUrl, filePath } = await handleFileUpload(file)

      const { error } = await supabase.from("banners").insert({
        ...formData,
        image_url: imageUrl,
        file_path: filePath,
      })

      if (error) throw error

      await loadBanners()
      setShowForm(false)
      setFormData({
        title: "",
        description: "",
        link_url: "",
        is_active: true,
        display_order: 1,
      })
      alert("Banner creado exitosamente")
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
        banner.display_order = i + 1
      })

      setBanners(newBanners)

      try {
        for (const banner of newBanners) {
          await supabase.from("banners").update({ display_order: banner.display_order }).eq("id", banner.id)
        }
      } catch (error) {
        console.error("Error reordering banners:", error)
        loadBanners()
      }
    }
  }

  const toggleBannerStatus = async (banner: Banner) => {
    try {
      const { error } = await supabase.from("banners").update({ is_active: !banner.is_active }).eq("id", banner.id)

      if (error) throw error

      setBanners(banners.map((b) => (b.id === banner.id ? { ...b, is_active: !b.is_active } : b)))
    } catch (error) {
      console.error("Error updating banner:", error)
    }
  }

  const handleDeleteBanner = async (banner: Banner) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este banner?")) return

    try {
      if (banner.file_path) {
        await supabase.storage.from("images").remove([banner.file_path])
      }

      const { error } = await supabase.from("banners").delete().eq("id", banner.id)

      if (error) throw error

      setBanners(banners.filter((b) => b.id !== banner.id))
      alert("Banner eliminado exitosamente")
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
            Información sobre Banners
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <p>
            <strong>Los banners se muestran en toda la página principal:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <strong>Formatos aceptados:</strong> JPG, PNG, WebP
            </li>
            <li>
              <strong>Tamaño máximo:</strong> 15MB por imagen
            </li>
            <li>
              <strong>Resolución recomendada:</strong> 1920x600 píxeles (ancho completo)
            </li>
            <li>
              <strong>Los banners ocupan todo el ancho de la página</strong>
            </li>
          </ul>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Banner</CardTitle>
            <CardDescription>
              Los banners se mostrarán en toda la página principal ocupando todo el ancho disponible.
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
                  <Label htmlFor="link_url">Enlace</Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="/categoria o URL externa"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_order">Orden de visualización</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Activo</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="image">Imagen del Banner *</Label>
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
                <h4 className="font-semibold text-lg">{banner.title}</h4>
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
                    className={banner.is_active ? "text-orange-600" : "text-green-600"}
                  >
                    {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    {banner.description && <p className="text-sm text-gray-600 mt-1">{banner.description}</p>}
                    <div className="flex gap-2 mt-2">
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline">Orden: {banner.display_order}</Badge>
                    </div>
                    {banner.link_url && <p className="text-xs text-gray-500 mt-2">Enlace: {banner.link_url}</p>}
                    <p className="text-xs text-gray-400">Creado: {new Date(banner.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={banner.image_url || "/placeholder.svg"}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
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

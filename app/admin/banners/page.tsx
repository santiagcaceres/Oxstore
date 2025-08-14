"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ImageIcon, Eye, EyeOff, ArrowUp, ArrowDown, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import SuccessNotification from "@/components/success-notification"

interface Banner {
  id: string
  title: string
  description: string
  image_url: string
  link_url: string
  banner_type: "hero" | "category" | "promotional" | "product" | "popup"
  banner_size: "large" | "medium" | "small" | "square"
  display_order: number
  is_active: boolean
  created_at: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [notification, setNotification] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  })

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link_url: "",
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

  const handleImageUpdate = async (banner: Banner, file: File) => {
    setUploading(banner.id)

    try {
      // Eliminar imagen anterior si existe
      if (banner.file_path) {
        await supabase.storage.from("images").remove([banner.file_path])
      }

      const { url: imageUrl, filePath } = await handleFileUpload(file)

      const { error } = await supabase
        .from("banners")
        .update({
          image_url: imageUrl,
          file_path: filePath,
        })
        .eq("id", banner.id)

      if (error) throw error

      await loadBanners()
      showNotification("Imagen actualizada correctamente")
    } catch (error) {
      console.error("Error updating image:", error)
      showNotification("Error al actualizar la imagen")
    } finally {
      setUploading(null)
    }
  }

  const handleBannerUpdate = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({
          title: formData.title,
          description: formData.description,
          link_url: formData.link_url,
        })
        .eq("id", banner.id)

      if (error) throw error

      await loadBanners()
      setEditingBanner(null)
      setFormData({ title: "", description: "", link_url: "" })
      showNotification("Banner actualizado correctamente")
    } catch (error) {
      console.error("Error updating banner:", error)
      showNotification("Error al actualizar el banner")
    }
  }

  const moveBanner = async (index: number, direction: "up" | "down") => {
    const newBanners = [...banners]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < banners.length) {
      ;[newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]]

      newBanners.forEach((banner, i) => {
        banner.display_order = i + 1
      })

      setBanners(newBanners)

      try {
        for (const banner of newBanners) {
          await supabase.from("banners").update({ display_order: banner.display_order }).eq("id", banner.id)
        }
        showNotification("Orden actualizado correctamente")
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

      showNotification(`Banner ${!banner.is_active ? "activado" : "desactivado"} correctamente`)
    } catch (error) {
      console.error("Error updating banner:", error)
    }
  }

  const startEditing = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      description: banner.description,
      link_url: banner.link_url,
    })
  }

  const cancelEditing = () => {
    setEditingBanner(null)
    setFormData({ title: "", description: "", link_url: "" })
  }

  const showNotification = (message: string) => {
    setNotification({ message, visible: true })
  }

  const hideNotification = () => {
    setNotification({ message: "", visible: false })
  }

  const getBannerTypeLabel = (type: string) => {
    const types = {
      hero: "Principal (Carousel)",
      category: "Categoría (Cuadrado)",
      promotional: "Promocional (Rectangular)",
      product: "Producto (Rectangular)",
      popup: "Popup (Modal)",
    }
    return types[type as keyof typeof types] || type
  }

  const getBannerSizeLabel = (size: string) => {
    const sizes = {
      large: "Grande (16:9)",
      medium: "Mediano (4:3)",
      small: "Pequeño (3:2)",
      square: "Cuadrado (1:1)",
    }
    return sizes[size as keyof typeof sizes] || size
  }

  const getRecommendedSize = (type: string) => {
    const sizes = {
      hero: "1200x675px (16:9)",
      category: "400x500px (4:5)",
      promotional: "800x400px (2:1)",
      product: "600x400px (3:2)",
      popup: "500x600px (5:6)",
    }
    return sizes[type as keyof typeof sizes] || "Tamaño personalizado"
  }

  const getAspectRatio = (type: string) => {
    const ratios = {
      hero: "aspect-[16/9]",
      category: "aspect-[4/5]",
      promotional: "aspect-[2/1]",
      product: "aspect-[3/2]",
      popup: "aspect-[5/6]",
    }
    return ratios[type as keyof typeof ratios] || "aspect-video"
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
      </div>

      <div className="space-y-4">
        {banners.map((banner, index) => (
          <Card key={banner.id} className="border-2 border-dashed border-gray-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-lg">{banner.title}</h4>
                  <Badge variant="outline">{getBannerTypeLabel(banner.banner_type)}</Badge>
                  <Badge variant="secondary" className="text-xs">
                    {getRecommendedSize(banner.banner_type)}
                  </Badge>
                </div>
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
                </div>
              </div>

              {editingBanner?.id === banner.id ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Título del banner"
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
                  <div className="flex gap-2">
                    <Button onClick={() => handleBannerUpdate(banner)}>Guardar Cambios</Button>
                    <Button variant="outline" onClick={cancelEditing}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
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
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEditing(banner)}>
                        Editar Contenido
                      </Button>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpdate(banner, file)
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploading === banner.id}
                        />
                        <Button variant="outline" size="sm" disabled={uploading === banner.id}>
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading === banner.id ? "Subiendo..." : "Cambiar Imagen"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`relative bg-gray-100 rounded-lg overflow-hidden ${getAspectRatio(banner.banner_type)}`}
                  >
                    <Image
                      src={banner.image_url || "/placeholder.svg"}
                      alt={banner.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No hay banners disponibles</p>
          <p className="text-sm text-gray-400 mt-2">Ejecuta el script SQL para crear los banners predefinidos</p>
        </div>
      )}

      <SuccessNotification message={notification.message} isVisible={notification.visible} onClose={hideNotification} />
    </div>
  )
}

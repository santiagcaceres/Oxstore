"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Edit, Upload, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface Banner {
  id: number
  title: string
  subtitle?: string
  image_url?: string
  link_url?: string
  position: string
  is_active: boolean
  created_at: string
  updated_at: string
}

const getBannerSizeInfo = (position: string) => {
  switch (position) {
    case "hero":
      return {
        size: "1920x600px",
        description: "Banner principal - Tamaño ideal: 1920x600px (Desktop) / 768x400px (Mobile)",
        aspectRatio: "16:5",
      }
    case "category-jeans":
    case "category-canguros":
    case "category-remeras":
    case "category-buzos":
      return {
        size: "800x400px",
        description: "Banner de categoría - Tamaño ideal: 800x400px",
        aspectRatio: "2:1",
      }
    case "gender-mujer":
    case "gender-hombre":
      return {
        size: "600x800px",
        description: "Banner de género - Tamaño ideal: 600x800px (vertical)",
        aspectRatio: "3:4",
      }
    case "final":
      return {
        size: "1200x300px",
        description: "Banner final - Tamaño ideal: 1200x300px",
        aspectRatio: "4:1",
      }
    default:
      return {
        size: "800x400px",
        description: "Banner genérico - Tamaño ideal: 800x400px",
        aspectRatio: "2:1",
      }
  }
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const loadBanners = async () => {
      try {
        console.log("[v0] Loading ALL banners from database...")
        const { data, error } = await supabase.from("banners").select("*").order("position", { ascending: true })

        if (error) {
          console.error("[v0] Error loading banners:", error)
        } else {
          console.log("[v0] Successfully loaded banners:", data?.length || 0)
          setBanners(data || [])
        }
      } catch (error) {
        console.error("[v0] Exception while loading banners:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBanners()
  }, [])

  const filteredBanners = banners.filter(
    (banner) =>
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleBannerStatus = async (bannerId: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", bannerId)

      if (!error) {
        setBanners((prev) =>
          prev.map((banner) => (banner.id === bannerId ? { ...banner, is_active: isActive } : banner)),
        )
      } else {
        console.error("Error updating banner status:", error)
      }
    } catch (error) {
      console.error("Error updating banner status:", error)
    }
  }

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner)
    setLinkUrl(banner.link_url || "")
    setTitle(banner.title || "")
    setSubtitle(banner.subtitle || "")
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingBanner || !event.target.files || event.target.files.length === 0) return

    const file = event.target.files[0]
    setUploading(true)

    try {
      console.log("[v0] Uploading image for banner:", editingBanner.id)

      // Upload to Supabase Storage
      const fileName = `banner-${editingBanner.id}-${Date.now()}.${file.name.split(".").pop()}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        console.error("[v0] Upload error:", uploadError)
        alert("Error subiendo imagen: " + uploadError.message)
        return
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("banners").getPublicUrl(fileName)

      console.log("[v0] Image uploaded successfully:", publicUrl)

      // Update banner in database
      const { error: updateError } = await supabase
        .from("banners")
        .update({
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingBanner.id)

      if (!updateError) {
        setBanners((prev) =>
          prev.map((banner) => (banner.id === editingBanner.id ? { ...banner, image_url: publicUrl } : banner)),
        )
        alert("Imagen actualizada correctamente!")
      } else {
        console.error("[v0] Error updating banner:", updateError)
        alert("Error actualizando banner: " + updateError.message)
      }
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
      alert("Error subiendo imagen")
    } finally {
      setUploading(false)
    }
  }

  const updateBannerTitles = async () => {
    if (!editingBanner) return

    try {
      const { error } = await supabase
        .from("banners")
        .update({
          title: title,
          subtitle: subtitle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingBanner.id)

      if (!error) {
        setBanners((prev) =>
          prev.map((banner) =>
            banner.id === editingBanner.id ? { ...banner, title: title, subtitle: subtitle } : banner,
          ),
        )
        alert("Títulos actualizados correctamente!")
      } else {
        console.error("Error updating banner titles:", error)
        alert("Error actualizando títulos")
      }
    } catch (error) {
      console.error("Error updating banner titles:", error)
      alert("Error actualizando títulos")
    }
  }

  const updateBannerLink = async () => {
    if (!editingBanner) return

    try {
      const { error } = await supabase
        .from("banners")
        .update({
          link_url: linkUrl,
          title: title,
          subtitle: subtitle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingBanner.id)

      if (!error) {
        setBanners((prev) =>
          prev.map((banner) =>
            banner.id === editingBanner.id
              ? { ...banner, link_url: linkUrl, title: title, subtitle: subtitle }
              : banner,
          ),
        )
        setEditingBanner(null)
        setLinkUrl("")
        setTitle("")
        setSubtitle("")
        alert("Banner actualizado correctamente!")
      } else {
        console.error("Error updating banner:", error)
        alert("Error actualizando banner")
      }
    } catch (error) {
      console.error("Error updating banner:", error)
      alert("Error actualizando banner")
    }
  }

  const getPositionBadge = (position: string) => {
    switch (position) {
      case "hero":
        return <Badge variant="default">Principal</Badge>
      case "category-jeans":
      case "category-canguros":
      case "category-remeras":
      case "category-buzos":
        return <Badge className="bg-purple-100 text-purple-800">Categoría</Badge>
      case "gender-mujer":
      case "gender-hombre":
        return <Badge className="bg-blue-100 text-blue-800">Género</Badge>
      case "final":
        return <Badge className="bg-green-100 text-green-800">Final</Badge>
      default:
        return <Badge variant="outline">{position}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Banners</h1>
          <p className="text-muted-foreground">Sube imágenes desde tu PC y configura enlaces de los banners</p>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            Guía de Tamaños Ideales
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <strong>Banner Principal (Hero):</strong>
              <br />
              1920x600px (Desktop)
              <br />
              768x400px (Mobile)
              <br />
              Ratio: 16:5
            </div>
            <div>
              <strong>Banners de Categoría:</strong>
              <br />
              800x400px
              <br />
              Ratio: 2:1
              <br />
              Formato horizontal
            </div>
            <div>
              <strong>Banners de Género:</strong>
              <br />
              600x800px
              <br />
              Ratio: 3:4
              <br />
              Formato vertical
            </div>
            <div>
              <strong>Banner Final:</strong>
              <br />
              1200x300px
              <br />
              Ratio: 4:1
              <br />
              Formato panorámico
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Banners Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{banners.filter((b) => b.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Posiciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(banners.map((b) => b.position)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Banners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Banners de la Tienda</CardTitle>
          <CardDescription>Sube imágenes desde tu PC y configura enlaces de destino</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando banners...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead>Tamaño Ideal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enlace</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanners.map((banner) => {
                  const sizeInfo = getBannerSizeInfo(banner.position)
                  return (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 h-12 relative rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={banner.image_url || "/placeholder.svg"}
                              alt={banner.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{banner.title}</p>
                            {banner.subtitle && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{banner.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getPositionBadge(banner.position)}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="font-medium text-blue-600">{sizeInfo.size}</div>
                          <div className="text-muted-foreground">Ratio {sizeInfo.aspectRatio}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={banner.is_active}
                            onCheckedChange={(checked) => toggleBannerStatus(banner.id, checked)}
                          />
                          <span className="text-sm">{banner.is_active ? "Activo" : "Inactivo"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{banner.link_url || "Sin enlace"}</code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(banner)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Editar Banner: {banner.title}</DialogTitle>
                              <DialogDescription>
                                Sube una imagen desde tu PC y configura el enlace de destino.
                                <br />
                                <strong>Tamaño recomendado:</strong> {getBannerSizeInfo(banner.position).description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                              <div className="space-y-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="banner-title" className="text-right">
                                    Título
                                  </Label>
                                  <Input
                                    id="banner-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Título del banner"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="banner-subtitle" className="text-right">
                                    Subtítulo
                                  </Label>
                                  <Input
                                    id="banner-subtitle"
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Subtítulo del banner (opcional)"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="banner-link-url" className="text-right">
                                    URL de Destino
                                  </Label>
                                  <Input
                                    id="banner-link-url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="col-span-3"
                                    placeholder="https://ejemplo.com o /categoria/jeans"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm font-medium mb-3 block">Imagen del Banner</Label>
                                <div className="space-y-4">
                                  <div className="w-full h-40 relative rounded-lg overflow-hidden bg-muted border-2 border-dashed">
                                    <Image
                                      src={editingBanner?.image_url || "/placeholder.svg"}
                                      alt={editingBanner?.title || "Banner"}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                      disabled={uploading}
                                      className="cursor-pointer"
                                    />
                                    {uploading && (
                                      <p className="text-sm text-muted-foreground mt-2">Subiendo imagen...</p>
                                    )}
                                    {editingBanner && (
                                      <p className="text-xs text-blue-600 mt-2">
                                        💡 {getBannerSizeInfo(editingBanner.position).description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={updateBannerTitles} variant="outline" disabled={uploading}>
                                Guardar Títulos
                              </Button>
                              <Button onClick={updateBannerLink} disabled={uploading}>
                                <Upload className="h-4 w-4 mr-2" />
                                Guardar Todo
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {filteredBanners.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No se encontraron banners. Ejecuta el script SQL para crear banners predefinidos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

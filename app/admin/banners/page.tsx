"use client"

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
import { Search, Edit, Upload } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import ImageUpload from "@/components/image-upload"

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

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [linkUrl, setLinkUrl] = useState("")

  useEffect(() => {
    const loadBanners = async () => {
      try {
        console.log("[v0] Starting to load banners from database...")
        const { data, error } = await supabase.from("banners").select("*").order("position", { ascending: true })

        if (error) {
          console.error("[v0] Error loading banners:", error)
          console.error("[v0] Error details:", JSON.stringify(error, null, 2))
        } else {
          console.log("[v0] Successfully loaded banners from database:", data)
          console.log("[v0] Number of banners loaded:", data?.length || 0)
          if (data && data.length > 0) {
            console.log("[v0] Banner positions found:", data.map((b) => b.position))
            console.log("[v0] Banner details:", data.map((b) => ({ id: b.id, title: b.title, position: b.position, active: b.is_active })))
          } else {
            console.log("[v0] No banners found in database")
          }
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

  const allowedPositions = [
    "hero", // Banner principal
    "category-jeans",
    "category-canguros",
    "category-remeras",
    "category-buzos", // Los 4 medianos
    "gender-hombre",
    "gender-mujer", // Hombre y mujer
    "final", // Banner final
  ]

  const displayBanners = filteredBanners.filter((banner) => allowedPositions.includes(banner.position))

  console.log("[v0] Total banners in state:", banners.length)
  console.log("[v0] Filtered banners:", filteredBanners.length)
  console.log("[v0] Display banners after position filter:", displayBanners.length)
  console.log("[v0] Allowed positions:", allowedPositions)
  if (banners.length > 0) {
    console.log("[v0] All banner positions in state:", banners.map((b) => b.position))
  }
  if (filteredBanners.length > 0) {
    console.log("[v0] Available positions in filtered banners:", filteredBanners.map((b) => b.position))
  }

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
  }

  const handleImageUploaded = async (newImageUrl: string) => {
    if (!editingBanner) return

    try {
      console.log("[v0] Updating banner image:", { bannerId: editingBanner.id, newImageUrl })

      const { error } = await supabase
        .from("banners")
        .update({
          image_url: newImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingBanner.id)

      if (!error) {
        setBanners((prev) =>
          prev.map((banner) => (banner.id === editingBanner.id ? { ...banner, image_url: newImageUrl } : banner)),
        )
        console.log("[v0] Banner image updated successfully")
      } else {
        console.error("[v0] Error updating banner image:", error)
      }
    } catch (error) {
      console.error("[v0] Error updating banner image:", error)
    }
  }

  const handleImageDeleted = async () => {
    if (!editingBanner) return

    const placeholderUrl = `/placeholder.svg?height=400&width=800&text=${encodeURIComponent(editingBanner.title)}`

    try {
      console.log("[v0] Resetting banner image to placeholder:", { bannerId: editingBanner.id, placeholderUrl })

      const { error } = await supabase
        .from("banners")
        .update({
          image_url: placeholderUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingBanner.id)

      if (!error) {
        setBanners((prev) =>
          prev.map((banner) => (banner.id === editingBanner.id ? { ...banner, image_url: placeholderUrl } : banner)),
        )
        console.log("[v0] Banner image reset successfully")
      } else {
        console.error("[v0] Error resetting banner image:", error)
      }
    } catch (error) {
      console.error("[v0] Error resetting banner image:", error)
    }
  }

  const updateBannerLink = async () => {
    if (!editingBanner) return

    try {
      const { error } = await supabase
        .from("banners")
        .update({
          link_url: linkUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingBanner.id)

      if (!error) {
        setBanners((prev) =>
          prev.map((banner) => (banner.id === editingBanner.id ? { ...banner, link_url: linkUrl } : banner)),
        )
        setEditingBanner(null)
        setLinkUrl("")
      } else {
        console.error("Error updating banner link:", error)
      }
    } catch (error) {
      console.error("Error updating banner link:", error)
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
          <h1 className="text-3xl font-bold">Banners Predefinidos</h1>
          <p className="text-muted-foreground">Sube imágenes desde tu PC y configura enlaces de los banners</p>
        </div>
      </div>

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
                  <TableHead>Estado</TableHead>
                  <TableHead>Enlace</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayBanners.map((banner) => (
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
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Editar Banner: {banner.title}</DialogTitle>
                            <DialogDescription>
                              Sube una imagen desde tu PC y configura el enlace de destino.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-6 py-4">
                            <div>
                              <Label className="text-sm font-medium mb-3 block">Imagen del Banner</Label>
                              <ImageUpload
                                bannerId={banner.id.toString()}
                                currentImageUrl={banner.image_url}
                                bannerPosition={banner.position}
                                onImageUploaded={handleImageUploaded}
                                onImageDeleted={handleImageDeleted}
                              />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="link-url" className="text-right">
                                Enlace URL
                              </Label>
                              <Input
                                id="link-url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="col-span-3"
                                placeholder="/categoria/mujer"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={updateBannerLink}>
                              <Upload className="h-4 w-4 mr-2" />
                              Guardar Enlace
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {displayBanners.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron banners.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

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
import { Search, Edit, Upload } from "lucide-react"
import type { Banner } from "@/lib/database"

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [linkUrl, setLinkUrl] = useState("")

  useEffect(() => {
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

    loadBanners()
  }, [])

  const filteredBanners = banners.filter(
    (banner) =>
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleBannerStatus = async (bannerId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      })

      if (response.ok) {
        setBanners((prev) =>
          prev.map((banner) => (banner.id === bannerId ? { ...banner, is_active: isActive } : banner)),
        )
      }
    } catch (error) {
      console.error("Error updating banner status:", error)
    }
  }

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner)
    setImageUrl(banner.image_url || "")
    setLinkUrl(banner.link_url || "")
  }

  const updateBanner = async () => {
    if (!editingBanner) return

    try {
      const response = await fetch(`/api/banners/${editingBanner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          link_url: linkUrl,
        }),
      })

      if (response.ok) {
        setBanners((prev) =>
          prev.map((banner) =>
            banner.id === editingBanner.id ? { ...banner, image_url: imageUrl, link_url: linkUrl } : banner,
          ),
        )
        setEditingBanner(null)
        setImageUrl("")
        setLinkUrl("")
      }
    } catch (error) {
      console.error("Error updating banner:", error)
    }
  }

  const getPositionBadge = (position: string) => {
    switch (position) {
      case "hero":
        return <Badge variant="default">Principal</Badge>
      case "secondary":
        return <Badge variant="secondary">Secundario</Badge>
      case "category":
        return <Badge className="bg-purple-100 text-purple-800">Categoría</Badge>
      case "offers":
        return <Badge className="bg-orange-100 text-orange-800">Ofertas</Badge>
      default:
        return <Badge variant="outline">{position}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banners Predefinidos</h1>
          <p className="text-muted-foreground">Edita las imágenes y enlaces de los banners de tu tienda</p>
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
          <CardDescription>Edita las imágenes y enlaces de destino de cada banner</CardDescription>
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
                {filteredBanners.map((banner) => (
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
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Editar Banner: {banner.title}</DialogTitle>
                            <DialogDescription>Cambia la imagen y el enlace de destino del banner.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="image-url" className="text-right">
                                Imagen URL
                              </Label>
                              <Input
                                id="image-url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="col-span-3"
                                placeholder="https://ejemplo.com/imagen.jpg"
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
                            {imageUrl && (
                              <div className="col-span-4">
                                <Label className="text-sm font-medium">Vista previa:</Label>
                                <div className="mt-2 w-full h-32 relative rounded-lg overflow-hidden bg-muted">
                                  <Image
                                    src={imageUrl || "/placeholder.svg"}
                                    alt="Vista previa"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button onClick={updateBanner}>
                              <Upload className="h-4 w-4 mr-2" />
                              Guardar Cambios
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

          {filteredBanners.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron banners.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

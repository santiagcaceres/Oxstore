"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, GripVertical } from "lucide-react"
import type { Banner } from "@/lib/database"

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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

  const deleteBanner = async (bannerId: number) => {
    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBanners((prev) => prev.filter((banner) => banner.id !== bannerId))
      }
    } catch (error) {
      console.error("Error deleting banner:", error)
    }
  }

  const getPositionBadge = (position: string) => {
    switch (position) {
      case "hero":
        return <Badge variant="default">Hero</Badge>
      case "secondary":
        return <Badge variant="secondary">Secundario</Badge>
      default:
        return <Badge variant="outline">{position}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">Gestiona los banners promocionales de tu tienda</p>
        </div>
        <Button asChild>
          <Link href="/admin/banners/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Crear Banner
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Banners Hero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners.filter((b) => b.position === "hero").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Banners Programados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners.filter((b) => b.start_date || b.end_date).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Banners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Banners</CardTitle>
          <CardDescription>Gestiona todos los banners promocionales de tu tienda</CardDescription>
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
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Banner</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="cursor-grab">
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-10 relative rounded-lg overflow-hidden bg-muted">
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
                      <div className="text-sm">
                        {banner.start_date && <p>Inicio: {new Date(banner.start_date).toLocaleDateString()}</p>}
                        {banner.end_date && <p>Fin: {new Date(banner.end_date).toLocaleDateString()}</p>}
                        {!banner.start_date && !banner.end_date && (
                          <span className="text-muted-foreground">Sin programar</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{banner.sort_order}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Vista previa
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/banners/${banner.id}/editar`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El banner será eliminado permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteBanner(banner.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

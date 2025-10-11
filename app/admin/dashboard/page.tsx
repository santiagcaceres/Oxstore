"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Plus, Settings, LogOut, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getArtworks, getFeaturedArtworks } from "@/app/actions/artworks"

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState({
    totalArtworks: 0,
    featuredArtworks: 0,
    categories: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
      loadStats()
    }
  }, [router])

  const loadStats = async () => {
    try {
      const [allArtworks, featuredArtworks] = await Promise.all([getArtworks(), getFeaturedArtworks()])

      const categories = new Set(allArtworks.map((artwork) => artwork.category))

      setStats({
        totalArtworks: allArtworks.length,
        featuredArtworks: featuredArtworks.length,
        categories: categories.size,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin-token")
    router.push("/admin/login")
  }

  if (!isAuthenticated) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Palette className="w-8 h-8 text-gray-800" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">Luciano Fulco</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido, Luciano</h2>
          <p className="text-gray-600">Gestiona tu portafolio artístico desde aquí</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Obras</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.totalArtworks}</p>
                </div>
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Obras Destacadas</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.featuredArtworks}</p>
                </div>
                <Palette className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categorías</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.categories}</p>
                </div>
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Gestión de Obras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Administra tu colección de obras de arte</p>
              <div className="flex gap-3">
                <Link href="/admin/obras/nueva">
                  <Button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
                    <Plus className="w-4 h-4" />
                    Nueva Obra
                  </Button>
                </Link>
                <Link href="/admin/obras">
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <ImageIcon className="w-4 h-4" />
                    Ver Todas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Sitio Web
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Accede a tu sitio web público</p>
              <div className="flex gap-3">
                <Link href="/" target="_blank">
                  <Button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
                    <Settings className="w-4 h-4" />
                    Ver Sitio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

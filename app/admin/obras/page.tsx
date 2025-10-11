"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Plus, Edit, Trash2, ImageIcon, ArrowLeft, CheckCircle, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getArtworks, deleteArtwork } from "@/app/actions/artworks"

export default function AdminObras() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [deletedArtworkTitle, setDeletedArtworkTitle] = useState("")
  const [showCreatedPopup, setShowCreatedPopup] = useState(false)
  const [createdArtworkTitle, setCreatedArtworkTitle] = useState("")
  const [showUpdatedPopup, setShowUpdatedPopup] = useState(false)
  const [updatedArtworkTitle, setUpdatedArtworkTitle] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
      loadArtworks()
    }
  }, [router])

  // Verificar si hay mensajes de éxito pendientes
  useEffect(() => {
    // Verificar si se creó una obra
    const createdData = localStorage.getItem("artwork-created")
    if (createdData) {
      try {
        const { title, timestamp } = JSON.parse(createdData)
        // Solo mostrar si es reciente (menos de 10 segundos)
        if (Date.now() - timestamp < 10000) {
          setCreatedArtworkTitle(title)
          setShowCreatedPopup(true)
        }
        localStorage.removeItem("artwork-created")
      } catch (error) {
        console.error("Error parsing created artwork data:", error)
        localStorage.removeItem("artwork-created")
      }
    }

    // Verificar si se actualizó una obra
    const updatedData = localStorage.getItem("artwork-updated")
    if (updatedData) {
      try {
        const { title, timestamp } = JSON.parse(updatedData)
        // Solo mostrar si es reciente (menos de 10 segundos)
        if (Date.now() - timestamp < 10000) {
          setUpdatedArtworkTitle(title)
          setShowUpdatedPopup(true)
        }
        localStorage.removeItem("artwork-updated")
      } catch (error) {
        console.error("Error parsing updated artwork data:", error)
        localStorage.removeItem("artwork-updated")
      }
    }
  }, [])

  // Auto-cerrar popups después de 3 segundos
  useEffect(() => {
    if (showCreatedPopup) {
      const timer = setTimeout(() => {
        setShowCreatedPopup(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showCreatedPopup])

  useEffect(() => {
    if (showUpdatedPopup) {
      const timer = setTimeout(() => {
        setShowUpdatedPopup(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showUpdatedPopup])

  useEffect(() => {
    if (showDeletePopup) {
      const timer = setTimeout(() => {
        setShowDeletePopup(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showDeletePopup])

  const loadArtworks = async () => {
    try {
      const data = await getArtworks()
      setArtworks(data)
    } catch (error) {
      console.error("Error loading artworks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la obra "${title}"?`)) {
      try {
        await deleteArtwork(id)
        // Recargar la lista después de eliminar
        await loadArtworks()
        // Mostrar popup de éxito
        setDeletedArtworkTitle(title)
        setShowDeletePopup(true)
      } catch (error) {
        console.error("Error deleting artwork:", error)
        alert("Error al eliminar la obra")
      }
    }
  }

  if (!isAuthenticated) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* SUCCESS POPUP PARA CREAR OBRA */}
      {showCreatedPopup && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-right-full duration-300">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">¡Obra Creada con Éxito!</p>
                  <p className="text-xs text-green-600 mt-1">"{createdArtworkTitle}" se ha guardado correctamente.</p>
                </div>
              </div>
              <button onClick={() => setShowCreatedPopup(false)} className="text-green-400 hover:text-green-600 ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP PARA EDITAR OBRA */}
      {showUpdatedPopup && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-right-full duration-300">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">¡Obra Actualizada con Éxito!</p>
                  <p className="text-xs text-blue-600 mt-1">"{updatedArtworkTitle}" se ha actualizado correctamente.</p>
                </div>
              </div>
              <button onClick={() => setShowUpdatedPopup(false)} className="text-blue-400 hover:text-blue-600 ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE SUCCESS POPUP */}
      {showDeletePopup && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-right-full duration-300">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">¡Obra Eliminada!</p>
                  <p className="text-xs text-red-600 mt-1">"{deletedArtworkTitle}" ha sido eliminada exitosamente.</p>
                </div>
              </div>
              <button onClick={() => setShowDeletePopup(false)} className="text-red-400 hover:text-red-600 ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-gray-800" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Gestión de Obras</h1>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link href="/admin/obras/nueva">
                <Button className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Obra
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Todas las Obras</h2>
          <p className="text-gray-600">
            {loading ? "Cargando..." : `Gestiona tu colección de ${artworks.length} obras`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando obras...</p>
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay obras</h3>
            <p className="text-gray-600 mb-4">Comienza agregando tu primera obra de arte</p>
            <Link href="/admin/obras/nueva">
              <Button className="bg-black hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Obra
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden">
                <div className="relative">
                  <Image
                    src={
                      artwork.main_image_url ||
                      `https://placehold.co/300x200/E5E7EB/374151/jpeg?text=${encodeURIComponent(artwork.title) || "/placeholder.svg"}`
                    }
                    alt={artwork.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <Badge variant={artwork.category === "acrilicos" ? "default" : "secondary"} className="capitalize">
                      {artwork.category}
                    </Badge>
                    {artwork.subcategory && (
                      <Badge variant="outline" className="capitalize bg-white/90 text-xs">
                        {artwork.subcategory}
                      </Badge>
                    )}
                    {artwork.featured && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Destacada
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant={artwork.status === "Disponible" ? "default" : "destructive"}>
                      {artwork.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{artwork.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{artwork.description}</p>
                  <p className="text-xl font-bold text-gray-900 mb-4">USD {artwork.price}</p>

                  <div className="flex gap-2">
                    <Link href={`/obra/${artwork.id}`} target="_blank">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/admin/obras/${artwork.id}/editar`}>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(artwork.id, artwork.title)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { toast } from "@/hooks/use-toast"
import { Search, Trash2, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { Popup } from "@/components/ui/popup"

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  dni: string | null
  created_at: string
  is_verified: boolean
  verified_at: string | null
}

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [popup, setPopup] = useState<{
    isOpen: boolean
    type: "success" | "error"
    title: string
    message: string
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  })

  const loadUsers = async () => {
    try {
      console.log("[v0] Starting loadUsers function")
      setLoading(true)

      console.log("[v0] Fetching from /api/admin/users")
      const response = await fetch("/api/admin/users")
      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Error response:", errorText)
        throw new Error("Error al cargar usuarios")
      }

      const data = await response.json()
      console.log("[v0] Response data:", data)
      console.log("[v0] Users count:", data.users?.length || 0)

      setUsers(data.users)
      setFilteredUsers(data.users)

      console.log("[v0] Users loaded successfully:", data.users.length)
    } catch (error) {
      console.error("[v0] Error loading users:", error)
      toast({
        title: "Error al cargar usuarios",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      console.log("[v0] loadUsers function completed")
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(term.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(term.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(term.toLowerCase()) ||
        user.dni?.includes(term),
    )
    setFilteredUsers(filtered)
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeleting(userId)

      console.log("[v0] Deleting user:", userId)

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Error deleting user:", errorText)
        throw new Error("Error al eliminar usuario")
      }

      console.log("[v0] User deleted successfully from database")

      setUsers((prev) => {
        const updated = prev.filter((user) => user.id !== userId)
        console.log("[v0] Users state updated, new count:", updated.length)
        return updated
      })
      setFilteredUsers((prev) => {
        const updated = prev.filter((user) => user.id !== userId)
        console.log("[v0] Filtered users state updated, new count:", updated.length)
        return updated
      })

      setPopup({
        isOpen: true,
        type: "success",
        title: "¡Usuario eliminado!",
        message: "El usuario ha sido eliminado correctamente del sistema.",
      })

      await loadUsers()
    } catch (error) {
      console.error("Error deleting user:", error)

      setPopup({
        isOpen: true,
        type: "error",
        title: "Error al eliminar usuario",
        message: "No se pudo eliminar el usuario. Inténtalo de nuevo.",
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleBulkDeleteUsers = async () => {
    try {
      setBulkDeleting(true)

      console.log("[v0] Starting bulk user deletion...")

      const response = await fetch("/api/admin/delete-users", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar usuarios")
      }

      const result = await response.json()
      console.log("[v0] Bulk deletion result:", result)

      setPopup({
        isOpen: true,
        type: "success",
        title: "Usuarios eliminados",
        message: `Se eliminaron ${result.deleted} de ${result.total} usuarios clientes correctamente.`,
      })

      await loadUsers()
    } catch (error) {
      console.error("[v0] Error in bulk deletion:", error)
      setPopup({
        isOpen: true,
        type: "error",
        title: "Error al eliminar usuarios",
        message: "No se pudieron eliminar los usuarios. Por favor, intenta nuevamente.",
      })
    } finally {
      setBulkDeleting(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administra los usuarios registrados en la plataforma</p>
      </div>

      {users.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Eliminar Todos los Usuarios Clientes
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Esta acción eliminará permanentemente todos los usuarios clientes (excepto administradores). Los pedidos
              asociados se mantendrán en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={bulkDeleting || users.length === 0}>
                  {bulkDeleting ? "Eliminando..." : `Eliminar ${users.length} usuarios clientes`}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción NO se puede deshacer. Se eliminarán permanentemente TODOS los usuarios clientes de la
                    base de datos (se mantendrán los administradores).
                    <br />
                    <br />
                    <strong className="text-destructive">Se eliminarán aproximadamente {users.length} usuarios.</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDeleteUsers}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sí, eliminar todos los usuarios
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>
            Total de usuarios: {users.length} | Mostrando: {filteredUsers.length}
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar por email, nombre o cédula..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : "Sin nombre"}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.dni && <div className="text-xs text-muted-foreground">Cédula: {user.dni}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sin teléfono</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.city || user.province ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {[user.city, user.province].filter(Boolean).join(", ")}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sin ubicación</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString("es-UY")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deleting === user.id}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
                                <strong>{user.email}</strong> y todos sus datos asociados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

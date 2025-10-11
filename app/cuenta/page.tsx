"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { User, Package, LogOut, Mail, Phone, Calendar, Eye, Edit, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

interface Order {
  id: string
  order_number: string
  total_amount: number
  payment_status: string
  order_status: string
  created_at: string
  shipping_method: string
  payment_method: string
  order_items: {
    id: string
    product_name: string
    product_image: string
    quantity: number
    price: number
    total_price: number
  }[]
}

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  created_at: string
}

export default function CuentaPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      if (profile) {
        setUser(profile)
        setEditData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone: profile.phone || "",
        })
      } else {
        // Si no existe el perfil, crearlo con los datos de auth
        const { data: newProfile } = await supabase
          .from("users")
          .insert({
            id: authUser.id,
            email: authUser.email || "",
            first_name: authUser.user_metadata?.first_name || "",
            last_name: authUser.user_metadata?.last_name || "",
            role: "customer",
          })
          .select()
          .single()

        if (newProfile) {
          setUser(newProfile)
          setEditData({
            first_name: newProfile.first_name || "",
            last_name: newProfile.last_name || "",
            phone: newProfile.phone || "",
          })
        }
      }

      // Obtener pedidos del usuario
      const { data: userOrders } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_name,
            product_image,
            quantity,
            price,
            total_price
          )
        `)
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })

      if (userOrders) {
        setOrders(userOrders)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("users")
        .update({
          first_name: editData.first_name,
          last_name: editData.last_name,
          phone: editData.phone,
        })
        .eq("id", user.id)

      if (error) throw error

      setUser((prev) =>
        prev
          ? {
              ...prev,
              first_name: editData.first_name,
              last_name: editData.last_name,
              phone: editData.phone,
            }
          : null,
      )

      setIsEditing(false)
      alert("Perfil actualizado correctamente")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error al actualizar el perfil")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // ... existing helper functions ...

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "confirmed":
        return "Confirmado"
      case "shipped":
        return "Enviado"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "paid":
        return "Pagado"
      case "failed":
        return "Fallido"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando cuenta...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <p>No se pudo cargar la cuenta. Por favor, inicia sesión nuevamente.</p>
            <Button onClick={() => router.push("/auth/login")} className="mt-4">
              Iniciar Sesión
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Mi Cuenta</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Información Personal
                    </div>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSaveProfile}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="firstName" className="text-xs">
                                Nombre
                              </Label>
                              <Input
                                id="firstName"
                                value={editData.first_name}
                                onChange={(e) => setEditData((prev) => ({ ...prev, first_name: e.target.value }))}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName" className="text-xs">
                                Apellido
                              </Label>
                              <Input
                                id="lastName"
                                value={editData.last_name}
                                onChange={(e) => setEditData((prev) => ({ ...prev, last_name: e.target.value }))}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">Cliente</p>
                        </>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <div className="flex-1">
                          <Input
                            value={editData.phone}
                            onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="Número de teléfono"
                            className="h-8 text-sm"
                          />
                        </div>
                      ) : (
                        <span className="text-sm">{user.phone || "No especificado"}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Miembro desde {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders History */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Historial de Pedidos ({orders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No tienes pedidos aún</p>
                      <Button onClick={() => router.push("/")} className="mt-4">
                        Comenzar a Comprar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">Pedido #{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${order.total_amount.toFixed(2)}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge className={getStatusColor(order.order_status)}>
                                  {getStatusText(order.order_status)}
                                </Badge>
                                <Badge variant="outline">{getPaymentStatusText(order.payment_status)}</Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{order.order_items.length} productos</span>
                              <span>•</span>
                              <span>{order.payment_method === "cash" ? "Efectivo" : "Tarjeta"}</span>
                              <span>•</span>
                              <span>{order.shipping_method === "pickup" ? "Retiro" : "Envío"}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {selectedOrder?.id === order.id ? "Ocultar" : "Ver Detalles"}
                            </Button>
                          </div>

                          {selectedOrder?.id === order.id && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="font-medium mb-3">Productos del Pedido</h4>
                              <div className="space-y-3">
                                {order.order_items.map((item) => (
                                  <div key={item.id} className="flex gap-3">
                                    <div className="relative w-12 h-12 flex-shrink-0">
                                      <Image
                                        src={item.product_image || "/placeholder.svg"}
                                        alt={item.product_name}
                                        fill
                                        className="object-cover rounded"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{item.product_name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="text-sm font-medium">${item.total_price.toFixed(2)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

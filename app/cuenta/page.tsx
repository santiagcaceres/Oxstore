"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  User,
  Package,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit,
  Save,
  X,
  MapPin,
  ShoppingBag,
  Lock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/contexts/cart-context"

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
  first_name: string
  last_name: string
  phone?: string
  dni?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  created_at: string
}

export default function CuentaPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [email, setEmail] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false)
  const [showPasswordError, setShowPasswordError] = useState(false)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("")
  const { state: cartState } = useCart()
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    dni: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
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

      setEmail(authUser.email || "")

      const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", authUser.id).single()

      if (profile) {
        setUser(profile)
        setEditData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone: profile.phone || "",
          dni: profile.dni || "",
          address: profile.address || "",
          city: profile.city || "",
          province: profile.province || "",
          postal_code: profile.postal_code || "",
        })
      }

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
        .from("user_profiles")
        .update({
          first_name: editData.first_name,
          last_name: editData.last_name,
          phone: editData.phone,
          dni: editData.dni,
          address: editData.address,
          city: editData.city,
          province: editData.province,
          postal_code: editData.postal_code,
        })
        .eq("id", user.id)

      if (error) throw error

      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...editData,
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

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordErrorMessage("Las contraseñas no coinciden")
      setShowPasswordError(true)
      return
    }

    if (newPassword.length < 6) {
      setPasswordErrorMessage("La contraseña debe tener al menos 6 caracteres")
      setShowPasswordError(true)
      return
    }

    setPasswordLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      })

      if (signInError) {
        setPasswordErrorMessage("La contraseña actual es incorrecta")
        setShowPasswordError(true)
        setPasswordLoading(false)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setPasswordErrorMessage(updateError.message)
        setShowPasswordError(true)
        setPasswordLoading(false)
        return
      }

      try {
        await fetch("/api/auth/password-changed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            firstName: user.first_name,
            lastName: user.last_name,
          }),
        })
      } catch (emailError) {
        console.error("Error sending password change email:", emailError)
      }

      setShowPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setShowPasswordChange(false)

      setTimeout(() => {
        setShowPasswordSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error changing password:", error)
      setPasswordErrorMessage("Error al cambiar la contraseña")
      setShowPasswordError(true)
    } finally {
      setPasswordLoading(false)
    }
  }

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
            <div className="lg:col-span-1 space-y-6">
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
                    <div className="flex-1">
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
                      <span className="text-sm">{email}</span>
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

                    {isEditing && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="dni" className="text-xs">
                            Cédula
                          </Label>
                          <Input
                            id="dni"
                            value={editData.dni}
                            onChange={(e) => setEditData((prev) => ({ ...prev, dni: e.target.value }))}
                            placeholder="Cédula"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-xs">
                            Dirección
                          </Label>
                          <Textarea
                            id="address"
                            value={editData.address}
                            onChange={(e) => setEditData((prev) => ({ ...prev, address: e.target.value }))}
                            placeholder="Calle y número"
                            className="text-sm"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-xs">
                              Ciudad
                            </Label>
                            <Input
                              id="city"
                              value={editData.city}
                              onChange={(e) => setEditData((prev) => ({ ...prev, city: e.target.value }))}
                              placeholder="Ciudad"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="province" className="text-xs">
                              Provincia
                            </Label>
                            <Input
                              id="province"
                              value={editData.province}
                              onChange={(e) => setEditData((prev) => ({ ...prev, province: e.target.value }))}
                              placeholder="Provincia"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal_code" className="text-xs">
                            Código Postal
                          </Label>
                          <Input
                            id="postal_code"
                            value={editData.postal_code}
                            onChange={(e) => setEditData((prev) => ({ ...prev, postal_code: e.target.value }))}
                            placeholder="Código Postal"
                            className="h-8 text-sm"
                          />
                        </div>
                      </>
                    )}

                    {!isEditing && user.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <p>{user.address}</p>
                          <p>
                            {user.city}, {user.province} {user.postal_code}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Miembro desde {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Seguridad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showPasswordChange ? (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setShowPasswordChange(true)}
                    >
                      Cambiar Contraseña
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-xs">
                          Contraseña Actual
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-xs">
                          Nueva Contraseña
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword" className="text-xs">
                          Confirmar Nueva Contraseña
                        </Label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={handlePasswordChange} disabled={passwordLoading}>
                          {passwordLoading ? "Cambiando..." : "Guardar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowPasswordChange(false)
                            setCurrentPassword("")
                            setNewPassword("")
                            setConfirmNewPassword("")
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {showPasswordSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">Contraseña cambiada exitosamente</p>
                    </div>
                  )}

                  {showPasswordError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{passwordErrorMessage}</p>
                      <Button size="sm" variant="ghost" className="mt-2" onClick={() => setShowPasswordError(false)}>
                        Cerrar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {cartState.itemCount > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Carrito Actual ({cartState.itemCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cartState.items.slice(0, 3).map((item) => (
                        <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-2">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {cartState.items.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{cartState.items.length - 3} productos más</p>
                      )}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between font-semibold mb-3">
                      <span>Total</span>
                      <span>${cartState.total.toFixed(2)}</span>
                    </div>
                    <Button asChild className="w-full" size="sm">
                      <Link href="/checkout">Finalizar Compra</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

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

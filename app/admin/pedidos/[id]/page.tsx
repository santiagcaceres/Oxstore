"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Truck, Package, User, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadOrder()
    }
  }, [params.id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      console.log("[v0] Loading order from API:", params.id)

      const response = await fetch(`/api/admin/orders/${params.id}`)

      if (!response.ok) {
        console.error("[v0] Error response:", response.status)
        throw new Error("Error al cargar el pedido")
      }

      const data = await response.json()
      console.log("[v0] Order loaded:", data.order)

      setOrder(data.order)
    } catch (error) {
      console.error("Error loading order:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    try {
      setUpdating(true)

      console.log("[v0] Updating order status to:", newStatus)

      const response = await fetch(`/api/admin/orders/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estado del pedido")
      }

      const data = await response.json()
      console.log("[v0] Order status updated successfully:", data.order)

      setOrder(data.order)
      alert("Estado del pedido actualizado correctamente. Se ha enviado un email al cliente.")
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Error al actualizar el estado del pedido")
    } finally {
      setUpdating(false)
    }
  }

  const updatePaymentStatus = async (newStatus: string) => {
    try {
      setUpdating(true)

      console.log("[v0] Updating payment status to:", newStatus)

      const supabase = createClient()

      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_status: newStatus,
        })
        .eq("id", params.id)
        .select()

      if (error) {
        console.error("Error updating payment status:", error)
        alert("Error al actualizar el estado del pago")
        return
      }

      console.log("[v0] Payment status updated successfully:", data)

      setOrder({ ...order, payment_status: newStatus })
      alert("Estado del pago actualizado correctamente")
    } catch (error) {
      console.error("Error updating payment status:", error)
      alert("Error al actualizar el estado del pago")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const, className: "bg-orange-500 text-white" },
      processing: { label: "En Proceso", variant: "secondary" as const, className: "bg-orange-500 text-white" },
      shipped: { label: "Enviado", variant: "default" as const, className: "bg-blue-500 text-white" },
      delivered: { label: "Entregado", variant: "default" as const, className: "bg-green-500 text-white" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const, className: "bg-orange-500 text-white" },
      approved: { label: "Aprobado", variant: "default" as const, className: "bg-green-500 text-white" },
      rejected: { label: "Rechazado", variant: "destructive" as const, className: "bg-red-500 text-white" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const generateInvoice = () => {
    if (!order) return

    try {
      console.log("[v0] Generating invoice for order:", order.id)
      const invoiceUrl = `/api/orders/${order.id}/invoice`

      // Abrir en nueva ventana y manejar posibles errores
      const newWindow = window.open(invoiceUrl, "_blank")

      if (!newWindow) {
        // Si el popup fue bloqueado, intentar descarga directa
        window.location.href = invoiceUrl
      }
    } catch (error) {
      console.error("Error generating invoice:", error)
      alert("Error al generar la factura. Por favor, intenta nuevamente.")
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Cargando pedido...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Pedido no encontrado</h3>
        <p className="text-muted-foreground">El pedido que buscas no existe o fue eliminado.</p>
        <Link href="/admin/pedidos">
          <Button className="mt-4">Volver a Pedidos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/pedidos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Pedido {order.order_number}</h1>
          <p className="text-muted-foreground">Detalles completos del pedido</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Pedido */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Información del Pedido</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Número de Orden</p>
                  <p className="font-semibold">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado del Pedido</p>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(order.order_status || order.status)}
                    <Select
                      value={order.order_status || order.status}
                      onValueChange={updateOrderStatus}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="processing">En Proceso</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado del Pago</p>
                  <div className="flex items-center space-x-2">
                    {getPaymentStatusBadge(order.payment_status)}
                    <Select value={order.payment_status} onValueChange={updatePaymentStatus} disabled={updating}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="approved">Aprobado</SelectItem>
                        <SelectItem value="rejected">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.products_in_stock?.image_url || "/placeholder.svg?height=60&width=60"}
                      alt={item.products_in_stock?.name || "Producto"}
                      className="w-15 h-15 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.products_in_stock?.name || item.product_name}</h4>
                      <p className="text-sm text-muted-foreground">{item.products_in_stock?.brand}</p>
                      <p className="text-sm">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.total_price || item.total}</p>
                      <p className="text-sm text-muted-foreground">${item.price} c/u</p>
                    </div>
                  </div>
                ))}

                {order.shipping_cost > 0 && (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-5 w-5" />
                      <span>Costo de Envío</span>
                    </div>
                    <span className="font-semibold">${order.shipping_cost}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border-2 rounded-lg bg-primary/5">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold">${order.total_amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información del Cliente y Acciones */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Cliente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                <p className="font-semibold">{order.customer_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-semibold">{order.customer_email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                <p className="font-semibold">{order.customer_phone || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Envío</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Método</p>
                <p className="font-semibold">
                  {order.shipping_method === "pickup" ? "Retiro en sucursal" : "Envío a domicilio"}
                </p>
              </div>
              {order.shipping_address && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                  <p className="font-semibold">{order.shipping_address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Método</p>
                <p className="font-semibold">{order.payment_method || "N/A"}</p>
              </div>
              {order.mercadopago_preference_id && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID Preferencia MP</p>
                  <p className="text-sm font-mono">{order.mercadopago_preference_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={generateInvoice} className="w-full bg-transparent" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar Factura
              </Button>
              {order.shipping_method === "delivery" && (
                <Link href={`/admin/pedidos/${order.id}/etiqueta`}>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Truck className="h-4 w-4 mr-2" />
                    Etiqueta de Envío
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

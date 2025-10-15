"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, Package, Eye, Download, Truck } from "lucide-react"
import Link from "next/link"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    totalAmount: 0,
  })

  useEffect(() => {
    loadOrders()

    const handleFocus = () => {
      loadOrders()
    }

    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  const loadOrders = async () => {
    try {
      console.log("[v0] Starting loadOrders function")
      setLoading(true)

      console.log("[v0] Fetching from /api/admin/orders")
      const response = await fetch("/api/admin/orders")

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (!response.ok) {
        console.error("[v0] Error response from API")
        return
      }

      const data = await response.json()
      console.log("[v0] Response data:", data)
      console.log("[v0] Orders count:", data.orders?.length || 0)

      const ordersData = data.orders || []
      setOrders(ordersData)

      const totalOrders = ordersData.length
      const pendingOrders = ordersData.filter((order: any) => order.status === "pending").length
      const confirmedOrders = ordersData.filter((order: any) => order.status === "confirmed").length
      const totalAmount = ordersData.reduce(
        (sum: number, order: any) => sum + Number.parseFloat(order.total_amount || 0),
        0,
      )

      setStats({
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        totalAmount,
      })

      console.log("[v0] Stats calculated:", {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        totalAmount,
      })
      console.log("[v0] Orders loaded successfully:", ordersData.length)
    } catch (error) {
      console.error("[v0] Exception in loadOrders:", error)
    } finally {
      setLoading(false)
      console.log("[v0] loadOrders function completed")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const, className: "bg-orange-500 text-white" },
      confirmed: { label: "Confirmado", variant: "default" as const, className: "bg-blue-500 text-white" },
      shipped: { label: "Enviado", variant: "outline" as const, className: "bg-blue-600 text-white" },
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

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const generateInvoice = (order: any) => {
    window.open(`/api/orders/${order.id}/invoice`, "_blank")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Gestión de pedidos y ventas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Pedidos registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Por procesar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">Pagos aprobados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ingresos totales</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
          <CardDescription>Lista de todos los pedidos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar pedidos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={loadOrders} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Cargando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {orders.length === 0 ? "No hay pedidos aún" : "No se encontraron pedidos"}
              </h3>
              <p className="text-muted-foreground">
                {orders.length === 0
                  ? "Los pedidos aparecerán aquí cuando los clientes realicen compras."
                  : "Intenta con otros términos de búsqueda."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{order.order_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()} - ${order.total_amount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_method === "pickup" ? "Retiro en sucursal" : "Envío a domicilio"}
                        {order.shipping_cost > 0 && ` (+$${order.shipping_cost})`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(order.order_status || order.status)}
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                  </div>

                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Productos:</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <img
                              src={item.products_in_stock?.image_url || "/placeholder.svg?height=40&width=40"}
                              alt={item.products_in_stock?.name || "Producto"}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.products_in_stock?.name || "Producto"}</p>
                              <p className="text-muted-foreground">
                                {item.products_in_stock?.brand} - Cantidad: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium">${item.total}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.shipping_address && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Dirección de envío:</h4>
                      <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                    </div>
                  )}

                  {order.notes && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Notas:</h4>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Link href={`/admin/pedidos/${order.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" onClick={() => generateInvoice(order)}>
                      <Download className="h-4 w-4 mr-2" />
                      Factura
                    </Button>
                    {order.shipping_method === "delivery" && (
                      <Link href={`/admin/pedidos/${order.id}/etiqueta`}>
                        <Button size="sm" variant="outline">
                          <Truck className="h-4 w-4 mr-2" />
                          Etiqueta de Envío
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

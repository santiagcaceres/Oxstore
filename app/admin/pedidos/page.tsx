"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, FileText, Truck } from "lucide-react"
import ShippingLabelPDF from "@/components/shipping-label-pdf"
import { shippingMethods } from "@/lib/shipping"
import type { Order } from "@/context/order-context" // Usamos el tipo de Order del contexto

// Mock data que simula un pedido real, incluyendo método de envío
const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    items: [{ id: "1", title: "Remera Premium", price: 35, quantity: 2, image: "" }],
    shipping: {
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan.perez@email.com",
      phone: "099123456",
      address: "Av. 18 de Julio 1234",
      city: "Montevideo",
      postalCode: "11200",
      country: "Uruguay",
    },
    shippingMethod: "dac", // ID del método de envío
    paymentMethod: "credit-card",
    subtotal: 70,
    shippingCost: 8,
    total: 78,
    createdAt: new Date().toISOString(),
    status: "Procesando",
  },
  // ... más pedidos mock
]

export default function PedidosAdminPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.shipping.firstName} ${order.shipping.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Procesando":
        return "bg-blue-100 text-blue-800"
      case "Enviado":
        return "bg-green-100 text-green-800"
      case "Entregado":
        return "bg-gray-100 text-gray-800"
      case "Cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por N° de pedido o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const shippingMethod = shippingMethods.find((sm) => sm.id === order.shippingMethod)
          return (
            <Card key={order.id}>
              <CardContent className="p-4 grid md:grid-cols-4 gap-4 items-center">
                <div>
                  <p className="font-bold">{order.id}</p>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString("es-UY")}</p>
                </div>
                <div>
                  <p className="font-medium">{`${order.shipping.firstName} ${order.shipping.lastName}`}</p>
                  <p className="text-sm text-gray-600">{order.shipping.city}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  {shippingMethod && (
                    <Badge variant="outline">
                      <Truck className="h-3 w-3 mr-1" />
                      {shippingMethod.name}
                    </Badge>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  {shippingMethod && <ShippingLabelPDF order={order} shippingMethod={shippingMethod} />}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { DollarSign, Package, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStats {
  totalVentas: number
  ventasHoy: number
  pedidosPendientes: number
  productosStock: number
  pedidosEnProceso: number
  pedidosEnviados: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVentas: 15420,
    ventasHoy: 850,
    pedidosPendientes: 12,
    productosStock: 156,
    pedidosEnProceso: 8,
    pedidosEnviados: 45,
  })

  const [recentOrders] = useState([
    {
      id: "ORD-001",
      customer: "María González",
      total: 125,
      status: "Pendiente",
      date: "2024-01-15",
      channel: "Web",
    },
    {
      id: "ORD-002",
      customer: "Juan Pérez",
      total: 89,
      status: "En Proceso",
      date: "2024-01-15",
      channel: "Web",
    },
    {
      id: "ORD-003",
      customer: "Ana Silva",
      total: 156,
      status: "Empaquetado",
      date: "2024-01-14",
      channel: "Web",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "text-yellow-600 bg-yellow-100"
      case "En Proceso":
        return "text-blue-600 bg-blue-100"
      case "Empaquetado":
        return "text-purple-600 bg-purple-100"
      case "Enviado":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">Última actualización: {new Date().toLocaleString()}</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalVentas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.ventasHoy}</div>
            <p className="text-xs text-muted-foreground">+5% vs ayer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pedidosPendientes}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos en Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productosStock}</div>
            <p className="text-xs text-muted-foreground">Sincronizado con Zureo</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
              Pedidos por Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Pendientes</span>
              <span className="font-semibold">{stats.pedidosPendientes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">En Proceso</span>
              <span className="font-semibold">{stats.pedidosEnProceso}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Enviados</span>
              <span className="font-semibold">{stats.pedidosEnviados}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <div>
                        <p className="font-semibold">${order.total}</p>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{order.channel}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

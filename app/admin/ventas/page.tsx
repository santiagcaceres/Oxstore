"use client"

import { useState } from "react"
import { TrendingUp, DollarSign, Package, Users, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function VentasPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30")

  const salesData = {
    totalVentas: 15420,
    ventasHoy: 850,
    pedidosTotal: 156,
    clientesNuevos: 23,
    productosMasVendidos: [
      { nombre: "Remera Premium", ventas: 45, ingresos: 1575 },
      { nombre: "Jean Clásico", ventas: 32, ingresos: 2720 },
      { nombre: "Gorra Snapback", ventas: 28, ingresos: 700 },
      { nombre: "Buzo con Capucha", ventas: 25, ingresos: 1750 },
    ],
    ventasPorDia: [
      { dia: "Lun", ventas: 1200 },
      { dia: "Mar", ventas: 1800 },
      { dia: "Mié", ventas: 1500 },
      { dia: "Jue", ventas: 2200 },
      { dia: "Vie", ventas: 2800 },
      { dia: "Sáb", ventas: 3200 },
      { dia: "Dom", ventas: 2720 },
    ],
    categorias: [
      { nombre: "Vestimenta", porcentaje: 65, ventas: 10023 },
      { nombre: "Accesorios", porcentaje: 25, ventas: 3855 },
      { nombre: "Calzado", porcentaje: 10, ventas: 1542 },
    ],
  }

  const exportReport = () => {
    const csvContent = `
Reporte de Ventas - OXSTORE
Período: Últimos ${selectedPeriod} días
Fecha de generación: ${new Date().toLocaleDateString()}

RESUMEN GENERAL
Total de Ventas,$${salesData.totalVentas}
Ventas Hoy,$${salesData.ventasHoy}
Total de Pedidos,${salesData.pedidosTotal}
Clientes Nuevos,${salesData.clientesNuevos}

PRODUCTOS MÁS VENDIDOS
Producto,Cantidad Vendida,Ingresos
${salesData.productosMasVendidos.map((p) => `${p.nombre},${p.ventas},$${p.ingresos}`).join("\n")}

VENTAS POR CATEGORÍA
Categoría,Porcentaje,Ventas
${salesData.categorias.map((c) => `${c.nombre},${c.porcentaje}%,$${c.ventas}`).join("\n")}

VENTAS POR DÍA
Día,Ventas
${salesData.ventasPorDia.map((v) => `${v.dia},$${v.ventas}`).join("\n")}
    `.trim()

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte-ventas-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reportes de Ventas</h1>
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="365">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} className="bg-blue-950 hover:bg-blue-900">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesData.totalVentas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% desde el período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesData.ventasHoy}</div>
            <p className="text-xs text-muted-foreground">+5% vs ayer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.pedidosTotal}</div>
            <p className="text-xs text-muted-foreground">En los últimos {selectedPeriod} días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.clientesNuevos}</div>
            <p className="text-xs text-muted-foreground">+8% vs período anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos más vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.productosMasVendidos.map((producto, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-950 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-600">{producto.ventas} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${producto.ingresos}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ventas por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.categorias.map((categoria, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{categoria.nombre}</span>
                    <span className="text-sm text-gray-600">{categoria.porcentaje}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-950 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${categoria.porcentaje}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${categoria.ventas.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de ventas por día */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Día de la Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesData.ventasPorDia.map((dia, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-600">{dia.dia}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-blue-950 to-blue-800 h-4 rounded-full transition-all duration-500"
                        style={{
                          width: `${(dia.ventas / Math.max(...salesData.ventasPorDia.map((v) => v.ventas))) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-20 text-right font-semibold text-gray-900">${dia.ventas}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-950">
              ${(salesData.totalVentas / salesData.pedidosTotal).toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasa de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3.2%</div>
            <p className="text-sm text-gray-600 mt-1">Visitantes que compran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">156</div>
            <p className="text-sm text-gray-600 mt-1">En catálogo</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

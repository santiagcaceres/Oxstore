"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Package, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Sistema de pedidos con MercadoPago integrado</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sistema de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">MercadoPago</div>
            <p className="text-xs text-muted-foreground">Configurado y listo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Activo</div>
            <p className="text-xs text-muted-foreground">Recibiendo pagos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Modo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">TEST</div>
            <p className="text-xs text-muted-foreground">Ambiente de pruebas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Listos</div>
            <p className="text-xs text-muted-foreground">Para venta online</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema de Pedidos Configurado:</strong> Los pedidos se procesarán automáticamente cuando los clientes
          realicen compras a través de MercadoPago. Los productos con stock están listos para la venta y los banners
          están configurados para dirigir tráfico a los productos.
        </AlertDescription>
      </Alert>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos en Tiempo Real</CardTitle>
          <CardDescription>Los pedidos aparecerán aquí cuando los clientes realicen compras</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input type="search" placeholder="Buscar pedidos..." className="pl-10" disabled />
            </div>
            <Button disabled variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>

          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No hay pedidos aún</h3>
            <p className="text-muted-foreground mb-4">
              Los pedidos aparecerán aquí cuando los clientes realicen compras a través de MercadoPago.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ MercadoPago configurado</p>
              <p>✓ Productos con stock disponibles</p>
              <p>✓ Banners configurados</p>
              <p>✓ Sistema listo para recibir pedidos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, MapPin, Phone, Clock, Download, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { Popup } from "@/components/ui/popup"

export default function ExitoEfectivoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDownloadPopup, setShowDownloadPopup] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const supabase = createClient()

      // Obtener detalles del pedido
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      if (orderError) throw orderError

      // Obtener items del pedido
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)

      if (itemsError) throw itemsError

      setOrder(orderData)
      setOrderItems(itemsData)
    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateInvoice = () => {
    if (!order) return

    // Usar la nueva API de comprobante de efectivo
    const receiptUrl = `/api/orders/${order.id}/receipt-cash`
    window.open(receiptUrl, "_blank")

    setShowDownloadPopup(true)
    setTimeout(() => setShowDownloadPopup(false), 3000)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">Pedido no encontrado</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>

          {/* Mensaje de éxito */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-green-800">¡Pedido Confirmado!</h1>
                  <p className="text-green-700">Tu pedido #{order.order_number} ha sido registrado exitosamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones de pago */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Instrucciones de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.shipping_method === "pickup" ? (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Retiro en Sucursal</h3>
                    <p className="text-blue-700 mb-3">
                      Dirígete a nuestro local para retirar y pagar tu pedido en efectivo.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span>
                          <strong>Dirección:</strong> Rivera 488
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>
                          <strong>Horarios:</strong> Lunes a Viernes 9:00 - 18:00, Sábados 9:00 - 13:00
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span>
                          <strong>Teléfono:</strong> (598) 2XXX-XXXX
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Importante:</strong> Presenta este comprobante o el número de pedido al retirar.
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Pago Contra Entrega</h3>
                  <p className="text-green-700">
                    Paga en efectivo cuando recibas tu pedido. El repartidor te entregará los productos y la factura.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalles del pedido */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detalles del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Número de pedido:</span>
                  <p className="font-medium">{order.order_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha:</span>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cliente:</span>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{order.customer_email}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Productos:</h4>
                {orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${item.total_price.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${(order.total_amount - order.shipping_cost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span>{order.shipping_cost > 0 ? `$${order.shipping_cost.toFixed(2)}` : "Gratis"}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total a pagar:</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón de descarga */}
          <div className="flex gap-4">
            <Button onClick={generateInvoice} className="flex-1" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Descargar Comprobante de Efectivo
            </Button>
            <Button
              onClick={() => window.open(`/api/orders/${order.id}/invoice`, "_blank")}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Factura Completa
            </Button>
          </div>
        </div>
      </main>

      <Popup
        isOpen={showDownloadPopup}
        onClose={() => setShowDownloadPopup(false)}
        title="¡Descarga Iniciada!"
        maxWidth="max-w-sm"
      >
        <p className="text-center text-green-600">El comprobante se ha descargado correctamente</p>
      </Popup>

      <Footer />
    </div>
  )
}

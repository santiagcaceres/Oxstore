"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, Truck, Download, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface OrderDetails {
  id: string
  order_number: string
  total_amount: number
  payment_status: string
  payment_method: string
  shipping_address: string
  shipping_method: string
  shipping_cost: number
  created_at: string
  customer_name: string
  customer_email: string
  customer_phone: string
  items: Array<{
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
    size?: string
    color?: string
  }>
}

export default function CheckoutExitoPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrderDetails(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [orderId])

  const handleDownloadInvoice = async () => {
    if (!orderId) return

    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `factura-${orderDetails?.order_number || orderId}.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading invoice:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <p>Cargando detalles del pedido...</p>
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
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-24 w-24 mx-auto text-green-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4">¡Pedido Confirmado!</h1>
          <p className="text-muted-foreground mb-8">Gracias por tu compra. Tu pedido ha sido procesado exitosamente.</p>

          {orderDetails && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="text-left space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Número de Pedido:</span>
                    <span className="font-mono">{orderDetails.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Estado del Pago:</span>
                    <span
                      className={`capitalize ${orderDetails.payment_status === "pending" ? "text-orange-600" : "text-green-600"}`}
                    >
                      {orderDetails.payment_status === "pending" ? "Pendiente" : "Aprobado"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Método de Pago:</span>
                    <span className="capitalize">
                      {orderDetails.payment_method === "cash" ? "Efectivo" : "MercadoPago"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">${orderDetails.total_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Método de Entrega:</span>
                    <span>
                      {orderDetails.shipping_method === "pickup" ? "Retiro en sucursal" : "Envío a domicilio"}
                      {orderDetails.shipping_cost > 0 && ` (+$${orderDetails.shipping_cost})`}
                    </span>
                  </div>
                  {orderDetails.shipping_method === "delivery" && (
                    <div className="flex justify-between">
                      <span className="font-medium">Dirección:</span>
                      <span className="text-right text-sm">{orderDetails.shipping_address}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Tiempo estimado:</span>
                    <span>
                      {orderDetails.shipping_method === "pickup" ? "Listo para retirar en 24hs" : "3-5 días hábiles"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Preparación</h3>
                <p className="text-sm text-muted-foreground">Tu pedido está siendo preparado</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                {orderDetails?.shipping_method === "pickup" ? (
                  <>
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-1">Retiro en Sucursal</h3>
                    <p className="text-sm text-muted-foreground">Te avisaremos cuando esté listo</p>
                  </>
                ) : (
                  <>
                    <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-1">Envío</h3>
                    <p className="text-sm text-muted-foreground">Recibirás un email con el tracking</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {orderDetails?.payment_method === "cash" && orderDetails?.payment_status === "pending" && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Pago en Efectivo</h3>
                <p className="text-sm text-orange-700">
                  {orderDetails.shipping_method === "pickup"
                    ? "Recuerda traer el dinero exacto al retirar tu pedido en nuestra sucursal."
                    : "Ten el dinero exacto listo para cuando llegue el repartidor."}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {orderDetails && (
              <Button
                onClick={handleDownloadInvoice}
                variant="outline"
                size="lg"
                className="w-full mb-2 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Factura
              </Button>
            )}
            <Button asChild size="lg">
              <Link href="/productos">Continuar Comprando</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

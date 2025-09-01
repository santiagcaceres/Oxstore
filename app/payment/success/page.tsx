"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, Truck } from "lucide-react"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")
  const [order, setOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderNumber) {
      loadOrderDetails()
    }
  }, [orderNumber])

  const loadOrderDetails = async () => {
    try {
      const { data: orderData } = await supabase.from("orders").select("*").eq("order_number", orderNumber).single()

      if (orderData) {
        setOrder(orderData)

        // Cargar items del pedido con información del producto
        const { data: itemsData } = await supabase
          .from("order_items")
          .select(`
            *,
            products_in_stock (name, image_url, brand)
          `)
          .eq("order_id", orderData.id)

        setOrderItems(itemsData || [])
      }
    } catch (error) {
      console.error("Error loading order:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadInvoice = () => {
    const invoiceContent = `
FACTURA - ${order.order_number}
Fecha: ${new Date(order.created_at).toLocaleDateString()}
Total: $${order.total_amount}

PRODUCTOS:
${orderItems
  .map((item) => `${item.products_in_stock?.name || "Producto"} - Cantidad: ${item.quantity} - Precio: $${item.price}`)
  .join("\n")}

ENVÍO:
Dirección: ${order.shipping_address}

¡Gracias por tu compra!
    `

    const blob = new Blob([invoiceContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `factura-${order.order_number}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando detalles de tu compra...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p>No se encontró información del pedido.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">¡Compra Exitosa!</CardTitle>
            <p className="text-gray-600">Tu pedido ha sido procesado correctamente</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Detalles del Pedido</h3>
                <p>
                  <strong>Número:</strong> {order.order_number}
                </p>
                <p>
                  <strong>Total:</strong> ${order.total_amount}
                </p>
                <p>
                  <strong>Estado:</strong> {order.status === "confirmed" ? "Confirmado" : "Pendiente"}
                </p>
                <p>
                  <strong>Fecha:</strong> {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  Información de Envío
                </h3>
                <p className="text-sm text-gray-600">{order.shipping_address || "Dirección no especificada"}</p>
                <p className="text-sm text-green-600 mt-2">Tiempo estimado: 3-5 días hábiles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Productos Comprados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img
                    src={item.products_in_stock?.image_url || "/placeholder.svg?height=60&width=60"}
                    alt={item.products_in_stock?.name || "Producto"}
                    className="w-15 h-15 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.products_in_stock?.name || "Producto"}</h4>
                    <p className="text-sm text-gray-600">{item.products_in_stock?.brand}</p>
                    <p className="text-sm">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.total}</p>
                    <p className="text-sm text-gray-600">${item.price} c/u</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={downloadInvoice} className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Descargar Factura
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Continuar Comprando
          </Button>
        </div>
      </div>
    </div>
  )
}

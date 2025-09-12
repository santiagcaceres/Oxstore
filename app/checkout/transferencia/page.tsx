"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Copy, MessageCircle, FileText, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/contexts/cart-context"
import { createClient } from "@/lib/supabase/client"

export default function TransferenciaPage() {
  const router = useRouter()
  const { clearCart } = useCart()
  const [orderData, setOrderData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem("transferOrderData")
    if (data) {
      setOrderData(JSON.parse(data))
    } else {
      router.push("/checkout")
    }
  }, [router])

  const accountNumber = "001518834 00001"
  const bankName = "Banco República Oriental del Uruguay (BROU)"
  const accountHolder = "OXSTORE ECOMMERCE"
  const cbu = "001518834000010000000001"
  const alias = "OXSTORE.PAGO"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copiado al portapapeles")
  }

  const sendWhatsApp = () => {
    if (!orderData) return

    const message = `Hola! Quiero enviar el comprobante de transferencia para mi pedido:
    
Total: $${orderData.total.toFixed(2)}
Cliente: ${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}
Email: ${orderData.customerInfo.email}
Teléfono: ${orderData.customerInfo.phone}

Por favor confirmen la recepción del pago.`

    const whatsappUrl = `https://wa.me/5491123456789?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const createOrder = async () => {
    if (!orderData || orderCreated) return

    setIsProcessing(true)
    try {
      const supabase = createClient()
      const orderNumber = `ORD-${Date.now()}`

      // Crear el pedido
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_email: orderData.customerInfo.email,
          customer_name: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
          customer_phone: orderData.customerInfo.phone,
          shipping_address:
            orderData.shippingMethod === "delivery"
              ? `${orderData.customerInfo.address}, ${orderData.customerInfo.city}, ${orderData.customerInfo.postalCode}`
              : "Retiro en sucursal",
          total_amount: orderData.total,
          shipping_cost: orderData.shippingCost,
          payment_method: "transfer",
          payment_status: "pending",
          order_status: "pending",
          shipping_method: orderData.shippingMethod,
          notes: `Pago por transferencia - Pendiente de confirmación`,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Crear los items del pedido
      for (const item of orderData.items) {
        const itemPrice = Number.parseFloat(item.price) || 0
        const itemQuantity = Number.parseInt(item.quantity) || 1
        const itemTotal = itemPrice * itemQuantity

        const { error: itemError } = await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          quantity: itemQuantity,
          price: itemPrice,
          total_price: itemTotal,
          total: itemTotal,
        })

        if (itemError) throw itemError
      }

      setOrderCreated(true)
      clearCart()
      localStorage.removeItem("transferOrderData")
    } catch (error) {
      console.error("Error creating transfer order:", error)
      alert("Error al crear el pedido. Por favor intente nuevamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (orderData && !orderCreated) {
      createOrder()
    }
  }, [orderData])

  if (!orderData) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => router.push("/checkout/otros-pagos")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a métodos de pago
          </Button>

          <h1 className="text-3xl font-bold mb-8">Pago por Transferencia</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datos para la Transferencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Banco</p>
                      <p className="text-sm text-muted-foreground">{bankName}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Titular</p>
                      <p className="text-sm text-muted-foreground">{accountHolder}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Número de Cuenta</p>
                      <p className="text-sm text-muted-foreground font-mono">{accountNumber}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(accountNumber)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">CBU</p>
                      <p className="text-sm text-muted-foreground font-mono">{cbu}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(cbu)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Alias</p>
                      <p className="text-sm text-muted-foreground">{alias}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(alias)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <div>
                      <p className="font-medium">Monto a Transferir</p>
                      <p className="text-lg font-bold text-primary">${orderData.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instrucciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <p>
                      Realiza la transferencia por el monto exacto: <strong>${orderData.total.toFixed(2)}</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <p>Toma una captura de pantalla o foto del comprobante de transferencia</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <p>Envía el comprobante por WhatsApp usando el botón de abajo</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <p>Espera la confirmación del pago para procesar tu pedido</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={sendWhatsApp} className="flex-1" size="lg">
                <MessageCircle className="h-5 w-5 mr-2" />
                Enviar Comprobante por WhatsApp
              </Button>
            </div>

            {orderCreated && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <FileText className="h-5 w-5" />
                    <p className="font-medium">Pedido creado exitosamente</p>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Tu pedido ha sido registrado y está pendiente de confirmación del pago.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

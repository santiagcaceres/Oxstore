"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Banknote, CreditCard, MapPin, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/contexts/cart-context"

export default function OtrosPagosPage() {
  const router = useRouter()
  const { clearCart } = useCart()
  const [orderData, setOrderData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const savedOrderData = localStorage.getItem("orderData")
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData))
    } else {
      router.push("/checkout")
    }
  }, [router])

  const handleCashPayment = async () => {
    if (!orderData) return

    setIsProcessing(true)
    try {
      console.log("[v0] Processing cash payment...")
      const supabase = createClient()

      // Generar número de orden único
      const orderNumber = `ORD-${Date.now()}`

      console.log("[v0] Order details:", {
        orderNumber,
        totalAmount: orderData.total,
        shippingCost: orderData.shippingCost,
        itemCount: orderData.items.length,
      })

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
              : "Retiro en sucursal - Rivera 488",
          total_amount: orderData.total,
          shipping_cost: orderData.shippingCost,
          payment_method: "cash",
          payment_status: "pending",
          order_status: "pending",
          shipping_method: orderData.shippingMethod,
          notes: `Pago en efectivo - ${orderData.shippingMethod === "pickup" ? "Retiro en sucursal Rivera 488" : "Envío a domicilio"}`,
        })
        .select()
        .single()

      if (orderError) {
        console.error("[v0] Error creating order:", orderError)
        throw orderError
      }

      console.log("[v0] Order created successfully:", order.id)

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

        if (itemError) {
          console.error("[v0] Error creating order item:", itemError)
          throw itemError
        }
      }

      console.log("[v0] All order items created successfully")
      localStorage.removeItem("orderData")
      clearCart()
      router.push(`/checkout/exito-efectivo?order_id=${order.id}`)
    } catch (error) {
      console.error("[v0] Error creating cash order:", error)
      alert(`Error al procesar el pedido: ${error.message || "Error desconocido"}. Por favor intente nuevamente.`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTransferPayment = () => {
    if (!orderData) return

    // Guardar datos para transferencia
    localStorage.setItem("transferOrderData", JSON.stringify(orderData))
    router.push("/checkout/transferencia")
  }

  if (!orderData) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <h1 className="text-3xl font-bold mb-8">Selecciona tu método de pago</h1>

          <div className="space-y-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCashPayment}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Banknote className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Pago en Efectivo</h3>
                    <p className="text-muted-foreground">
                      {orderData.shippingMethod === "pickup"
                        ? "Paga al retirar en nuestro local - Rivera 488"
                        : "Paga al recibir tu pedido"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${orderData.total.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total a pagar</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleTransferPayment}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Transferencia Bancaria</h3>
                    <p className="text-muted-foreground">Pago por transferencia o depósito bancario</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${orderData.total.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total a pagar</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen del pedido */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({orderData.items.length} productos)</span>
                  <span>${(orderData.total - orderData.shippingCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {orderData.shippingMethod === "pickup" ? (
                      <>
                        <MapPin className="h-4 w-4" />
                        Retiro en sucursal
                      </>
                    ) : (
                      <>
                        <Truck className="h-4 w-4" />
                        Envío a domicilio
                      </>
                    )}
                  </span>
                  <span>{orderData.shippingCost > 0 ? `$${orderData.shippingCost.toFixed(2)}` : "Gratis"}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

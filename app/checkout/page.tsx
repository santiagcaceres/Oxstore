"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CreditCard, Truck, Shield, MapPin, Banknote } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MercadoPagoButton } from "@/components/mercadopago-button"
import { createClient } from "@/lib/supabase/client"

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("mercadopago")
  const [shippingMethod, setShippingMethod] = useState("pickup")
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMercadoPagoSuccess = (orderId: string) => {
    clearCart()
    router.push(`/payment/success?order_id=${orderId}`)
  }

  const handleMercadoPagoError = () => {
    router.push("/payment/failure")
  }

  const handleCashPayment = async () => {
    if (!isFormValid) return

    setIsProcessing(true)
    try {
      console.log("[v0] Processing cash payment...")
      const supabase = createClient()

      // Generar número de orden único
      const orderNumber = `ORD-${Date.now()}`

      // Calcular total con envío
      const shippingCost = shippingMethod === "delivery" ? 250 : 0
      const totalAmount = state.total + shippingCost

      console.log("[v0] Order details:", {
        orderNumber,
        totalAmount,
        shippingCost,
        itemCount: state.items.length,
      })

      // Crear el pedido
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_email: formData.email,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_phone: formData.phone,
          shipping_address:
            shippingMethod === "delivery"
              ? `${formData.address}, ${formData.city}, ${formData.postalCode}`
              : "Retiro en sucursal",
          total_amount: totalAmount,
          shipping_cost: shippingCost,
          payment_method: "cash",
          payment_status: "pending",
          order_status: "pending",
          shipping_method: shippingMethod,
          notes: `Pago en efectivo - ${shippingMethod === "pickup" ? "Retiro en sucursal" : "Envío a domicilio"}`,
        })
        .select()
        .single()

      if (orderError) {
        console.error("[v0] Error creating order:", orderError)
        throw orderError
      }

      console.log("[v0] Order created successfully:", order.id)

      // Crear los items del pedido
      for (const item of state.items) {
        const { error: itemError } = await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          size: item.size,
          color: item.color,
        })

        if (itemError) {
          console.error("[v0] Error creating order item:", itemError)
          throw itemError
        }
      }

      console.log("[v0] All order items created successfully")
      clearCart()
      router.push(`/checkout/exito?order_id=${order.id}`)
    } catch (error) {
      console.error("[v0] Error creating cash order:", error)
      alert(`Error al procesar el pedido: ${error.message || "Error desconocido"}. Por favor intente nuevamente.`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (state.items.length === 0) {
    router.push("/carrito")
    return null
  }

  const isFormValid =
    formData.email &&
    formData.firstName &&
    formData.lastName &&
    formData.phone &&
    (shippingMethod === "pickup" || (formData.address && formData.city && formData.postalCode))

  const shippingCost = shippingMethod === "delivery" ? 250 : 0
  const totalWithShipping = state.total + shippingCost

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Método de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Retiro en Sucursal</div>
                            <div className="text-sm text-muted-foreground">Gratis - Retira en nuestro local</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Envío a Domicilio</div>
                            <div className="text-sm text-muted-foreground">$250 - Entrega en 3-5 días hábiles</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {shippingMethod === "delivery" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dirección de Envío</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Código Postal</Label>
                        <Input
                          id="postalCode"
                          required
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Método de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="mercadopago" id="mercadopago" />
                      <Label htmlFor="mercadopago" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Tarjeta de Crédito/Débito</div>
                            <div className="text-sm text-muted-foreground">Pago seguro con MercadoPago</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Pago en Efectivo</div>
                            <div className="text-sm text-muted-foreground">
                              {shippingMethod === "pickup" ? "Paga al retirar" : "Paga al recibir"}
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {isFormValid && (
                    <div className="mt-4">
                      {paymentMethod === "mercadopago" ? (
                        <MercadoPagoButton
                          items={state.items.map((item) => ({
                            ...item,
                            price: item.price,
                          }))}
                          customerInfo={formData}
                          shippingCost={shippingCost}
                          shippingMethod={shippingMethod}
                          onSuccess={handleMercadoPagoSuccess}
                          onError={handleMercadoPagoError}
                        />
                      ) : (
                        <Button onClick={handleCashPayment} disabled={isProcessing} className="w-full" size="lg">
                          {isProcessing ? "Procesando..." : "Confirmar Pedido"}
                        </Button>
                      )}
                    </div>
                  )}

                  {!isFormValid && (
                    <p className="text-muted-foreground text-sm">Complete todos los campos para continuar</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {state.items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        {item.size && <p className="text-xs text-muted-foreground">Talla: {item.size}</p>}
                        {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                        <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${state.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Envío</span>
                      <span>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : "Gratis"}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${totalWithShipping.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Features */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Compra segura y protegida</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                    <Truck className="h-4 w-4" />
                    <span>
                      {shippingMethod === "pickup" ? "Retiro gratis en sucursal" : "Envío a domicilio por $250"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

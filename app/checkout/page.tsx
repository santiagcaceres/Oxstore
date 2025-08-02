"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { useOrder } from "@/context/order-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Truck, CreditCard, MapPin } from "lucide-react"
import Image from "next/image"
// import { createOrderInZureo } from "@/lib/zureo-api"
// import type { ZureoOrder } from "@/types/zureo"

export default function CheckoutPage() {
  const router = useRouter()
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { dispatch: orderDispatch } = useOrder()

  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("credit-card")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Uruguay",
  })

  const subtotal = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = shippingMethod === "express" ? 450 : shippingMethod === "standard" ? 250 : 0
  const total = subtotal + shippingCost

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cartState.items.length === 0) {
      alert("Tu carrito está vacío")
      router.push("/carrito")
      return
    }
    setIsProcessing(true)

    // Simular procesamiento
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Crear el pedido para el contexto y la UI
    const order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      items: cartState.items,
      shipping: formData,
      shippingMethod,
      paymentMethod,
      subtotal,
      shippingCost,
      total,
      createdAt: new Date().toISOString(),
      status: "Confirmado",
    }

    // TODO: Formatear y enviar a Zureo
    /*
    const zureoOrder: Omit<ZureoOrder, "id_empresa"> = {
      fecha: new Date().toISOString().split('T')[0],
      id_moneda: 1, // Asumir UYU
      envio: { id: 1, costo: shippingCost, direccion: { calle: formData.address, numero: 'N/A', id_ciudad: 1 } },
      pago: { modalidad: 1, importe: total, moneda: 1 },
      productos: cartState.items.map(item => ({
        id_producto: parseInt(item.id.split('-')[0]),
        cantidad: item.quantity,
        precio_unitario: item.price
      })),
      cliente: {
        nombre: formData.firstName,
        apellido: formData.lastName,
        email: formData.email,
        telefono: formData.phone,
        guardar_como: `${formData.firstName} ${formData.lastName}`,
        direccion: { calle: formData.address, numero: 'N/A', id_ciudad: 1 }
      }
    };

    try {
      await createOrderInZureo(zureoOrder);
    } catch (error) {
      console.error("Error al enviar pedido a Zureo:", error);
      // Manejar el error, quizás mostrar un mensaje al usuario
    }
    */

    orderDispatch({ type: "CREATE_ORDER", payload: order })
    cartDispatch({ type: "CLEAR_CART" })
    router.push("/confirmacion")

    setIsProcessing(false)
  }

  if (cartState.items.length === 0 && !isProcessing) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
          <Button onClick={() => router.push("/")} className="bg-blue-950 hover:bg-blue-900">
            Continuar Comprando
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Columna de formularios */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" /> Información de Envío
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* ... campos del formulario ... */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nombre *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Apellido *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="address">Dirección *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Ciudad *</Label>
                        <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Código Postal *</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" /> Método de Envío
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-2">
                      <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer">
                        <RadioGroupItem value="standard" id="standard" />
                        <div className="flex-1">
                          <div className="font-medium">Envío estándar (UES / DAC)</div>
                          <div className="text-sm text-gray-600">5-7 días hábiles</div>
                        </div>
                        <span className="font-bold">$250</span>
                      </Label>
                      <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer">
                        <RadioGroupItem value="express" id="express" />
                        <div className="flex-1">
                          <div className="font-medium">Envío express (Mirtrans)</div>
                          <div className="text-sm text-gray-600">2-3 días hábiles</div>
                        </div>
                        <span className="font-bold">$450</span>
                      </Label>
                    </RadioGroup>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" /> Método de Pago (Próximamente)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      La integración con Mercado Pago se activará pronto. Por ahora, los pedidos se confirmarán
                      directamente.
                    </p>
                  </CardContent>
                </Card>
              </div>
              {/* Columna de resumen */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {cartState.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                            <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium">${(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Envío</span>
                        <span>{shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString()}`}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${total.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-blue-950 hover:bg-blue-900"
                      size="lg"
                    >
                      {isProcessing ? "Procesando..." : `Confirmar Pedido`}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

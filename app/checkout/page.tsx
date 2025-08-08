"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import { CreditCard, Truck, ShoppingBag, Loader2 } from 'lucide-react'
import Image from "next/image"

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Datos personales
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dni: "",
    
    // Dirección de envío
    address: "",
    addressNumber: "",
    city: "",
    state: "",
    zipCode: "",
    
    // Método de envío
    shippingMethod: "standard",
  })

  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingCost = formData.shippingMethod === "express" ? 2500 : 1500
  const total = subtotal + shippingCost

  useEffect(() => {
    if (state.items.length === 0) {
      router.push("/carrito")
    }
  }, [state.items, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Preparar datos para MercadoPago
      const paymentData = {
        items: state.items.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price.toString(),
        })),
        payer: {
          name: formData.firstName,
          surname: formData.lastName,
          email: formData.email,
          phone: {
            area_code: "11",
            number: formData.phone,
          },
          identification: {
            type: "DNI",
            number: formData.dni,
          },
          address: {
            street_name: formData.address,
            street_number: formData.addressNumber,
            zip_code: formData.zipCode,
          },
        },
        shipments: {
          cost: shippingCost.toString(),
          receiver_address: {
            street_name: formData.address,
            street_number: formData.addressNumber,
            zip_code: formData.zipCode,
            city_name: formData.city,
            state_name: formData.state,
            country_name: "Argentina",
          },
        },
      }

      // Crear preferencia de pago en MercadoPago
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error("Error al crear el pago")
      }

      const { init_point, sandbox_init_point } = await response.json()
      
      // Redirigir a MercadoPago (usar sandbox_init_point en desarrollo)
      const paymentUrl = process.env.NODE_ENV === "production" ? init_point : sandbox_init_point
      window.location.href = paymentUrl
      
    } catch (error) {
      console.error("Error en el checkout:", error)
      alert("Error al procesar el pago. Por favor, intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  if (state.items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dni">DNI</Label>
                      <Input
                        id="dni"
                        value={formData.dni}
                        onChange={(e) => handleInputChange("dni", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Dirección de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="addressNumber">Número</Label>
                      <Input
                        id="addressNumber"
                        value={formData.addressNumber}
                        onChange={(e) => handleInputChange("addressNumber", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Provincia</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Código Postal</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingMethod">Método de Envío</Label>
                    <Select value={formData.shippingMethod} onValueChange={(value) => handleInputChange("shippingMethod", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Envío Estándar (5-7 días) - $1.500</SelectItem>
                        <SelectItem value="express">Envío Express (2-3 días) - $2.500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen del pedido */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Productos */}
                  <div className="space-y-3">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.title}</h3>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity}
                          </p>
                          {item.selectedVariant && (
                            <p className="text-xs text-gray-500">
                              {item.selectedVariant.title}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totales */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span>${shippingCost.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <Button 
                      type="submit" 
                      className="w-full bg-black hover:bg-gray-800" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pagar con Mercado Pago
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="text-center text-sm text-gray-600">
                    <p>Pago seguro con Mercado Pago</p>
                    <p>Aceptamos todas las tarjetas</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

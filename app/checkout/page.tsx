"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CreditCard, Truck, Shield, MapPin, Banknote, User, LogIn } from "lucide-react"
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
import { Popup } from "@/components/ui/popup"

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("mercadopago")
  const [shippingMethod, setShippingMethod] = useState("pickup")
  const [user, setUser] = useState(null)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authMode, setAuthMode] = useState("login") // "login" or "register"
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUser(user)
      const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
      if (profile) {
        console.log("[v0] User profile loaded:", profile)
        setFormData((prev) => ({
          ...prev,
          email: profile.email || user.email || "",
          firstName: profile.first_name || user.user_metadata?.first_name || "",
          lastName: profile.last_name || user.user_metadata?.last_name || "",
          phone: profile.phone || "",
        }))
      } else {
        console.log("[v0] No profile found, using auth data")
        setFormData((prev) => ({
          ...prev,
          email: user.email || "",
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
        }))
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAuthInputChange = (field: string, value: string) => {
    setAuthData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    try {
      if (authMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        })

        if (error) throw error

        setUser(data.user)
        setShowAuthForm(false)

        const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()
        if (profile) {
          setFormData((prev) => ({
            ...prev,
            email: profile.email || data.user.email || "",
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            phone: profile.phone || "",
          }))
        }
      } else {
        if (authData.password !== authData.confirmPassword) {
          alert("Las contraseñas no coinciden")
          return
        }

        // Verificar si ya existe el email
        const { data: existingUser } = await supabase.from("users").select("email").eq("email", authData.email).single()

        if (existingUser) {
          alert("Ya existe una cuenta con este email")
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email: authData.email,
          password: authData.password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/checkout`,
            data: {
              first_name: authData.firstName,
              last_name: authData.lastName,
            },
          },
        })

        if (error) throw error

        // Crear perfil en tabla users
        if (data.user) {
          await supabase.from("users").insert({
            id: data.user.id,
            email: authData.email,
            first_name: authData.firstName,
            last_name: authData.lastName,
            role: "customer",
          })

          setUser(data.user)
          setShowAuthForm(false)

          // Prellenar formulario
          setFormData((prev) => ({
            ...prev,
            email: authData.email,
            firstName: authData.firstName,
            lastName: authData.lastName,
          }))

          alert("Cuenta creada exitosamente.")
        }
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleMercadoPagoSuccess = (orderId: string) => {
    clearCart()
    router.push(`/payment/success?order_id=${orderId}`)
  }

  const handleMercadoPagoError = () => {
    router.push("/payment/failure")
  }

  const handleCashPayment = async () => {
    if (!isFormValid) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    if (!user) {
      setShowAuthForm(true)
      return
    }

    setIsProcessing(true)
    try {
      console.log("[v0] Processing cash payment...")
      const supabase = createClient()

      let numericUserId = null
      const { data: userRecord } = await supabase.from("users").select("id").eq("email", user.email).single()

      if (userRecord) {
        numericUserId = userRecord.id
      }

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
        userId: numericUserId,
      })

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: numericUserId, // Usar el ID numérico de la tabla users
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
        const itemPrice = Number.parseFloat(item.price) || 0
        const itemQuantity = Number.parseInt(item.quantity) || 1
        const itemTotal = itemPrice * itemQuantity

        const { error: itemError } = await supabase.from("order_items").insert({
          order_id: order.id, // Este es un integer SERIAL
          product_id: Number.parseInt(item.id) || null, // Convertir a integer
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
      clearCart()
      alert("¡Pedido creado exitosamente!")
      router.push(`/checkout/exito?order_id=${order.id}`)
    } catch (error) {
      console.error("[v0] Error creating cash order:", error)
      alert(`Error al procesar el pedido: ${error.message || "Error desconocido"}. Por favor intente nuevamente.`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOtherPaymentMethods = () => {
    if (!isFormValid) return

    // Guardar datos del pedido en localStorage para la página de selección
    const orderData = {
      items: state.items,
      total: totalWithShipping,
      customerInfo: formData,
      shippingMethod,
      shippingCost,
    }
    localStorage.setItem("orderData", JSON.stringify(orderData))
    router.push("/checkout/otros-pagos")
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

          {!user && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-800">Inicia sesión para continuar</p>
                    <p className="text-sm text-orange-600">Necesitas una cuenta para realizar el pedido</p>
                  </div>
                  <Button onClick={() => setShowAuthForm(true)} variant="outline" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {user && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Sesión iniciada como {user.email}</p>
                    <p className="text-sm text-green-600">Puedes proceder con tu compra</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

              {/* Método de Entrega */}
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
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Otros Métodos de Pago</div>
                            <div className="text-sm text-muted-foreground">Efectivo o Transferencia Bancaria</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {isFormValid && user && (
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
                      ) : paymentMethod === "other" ? (
                        <Button onClick={handleOtherPaymentMethods} className="w-full" size="lg">
                          Continuar con Otros Métodos de Pago
                        </Button>
                      ) : null}
                    </div>
                  )}

                  {!user && <p className="text-muted-foreground text-sm">Inicia sesión para continuar con el pago</p>}

                  {user && !isFormValid && (
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

      <Popup
        isOpen={showAuthForm}
        onClose={() => setShowAuthForm(false)}
        title={authMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Label htmlFor="authEmail">Email</Label>
            <Input
              id="authEmail"
              type="email"
              required
              value={authData.email}
              onChange={(e) => handleAuthInputChange("email", e.target.value)}
            />
          </div>

          {authMode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authFirstName">Nombre</Label>
                  <Input
                    id="authFirstName"
                    required
                    value={authData.firstName}
                    onChange={(e) => handleAuthInputChange("firstName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="authLastName">Apellido</Label>
                  <Input
                    id="authLastName"
                    required
                    value={authData.lastName}
                    onChange={(e) => handleAuthInputChange("lastName", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="authPassword">Contraseña</Label>
            <Input
              id="authPassword"
              type="password"
              required
              value={authData.password}
              onChange={(e) => handleAuthInputChange("password", e.target.value)}
            />
          </div>

          {authMode === "register" && (
            <div>
              <Label htmlFor="authConfirmPassword">Confirmar Contraseña</Label>
              <Input
                id="authConfirmPassword"
                type="password"
                required
                value={authData.confirmPassword}
                onChange={(e) => handleAuthInputChange("confirmPassword", e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {authMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAuthForm(false)}>
              Cancelar
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
              className="text-sm text-primary hover:underline"
            >
              {authMode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </form>
      </Popup>

      <Footer />
    </div>
  )
}

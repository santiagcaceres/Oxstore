"use client"

import { useState, useEffect } from "react"
import { Wallet } from "@mercadopago/sdk-react"
import { useCart } from "@/contexts/cart-context"

interface MercadoPagoButtonProps {
  title: string
  price: number
  quantity?: number
  productId?: number
  showCustomerForm?: boolean
}

export function MercadoPagoButton({
  title,
  price,
  quantity = 1,
  productId,
  showCustomerForm = true,
}: MercadoPagoButtonProps) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [sdkInitialized, setSdkInitialized] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [showForm, setShowForm] = useState(false)
  const { items: cartItems, clearCart } = useCart()

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const response = await fetch("/api/mercadopago/init")
        const { publicKey } = await response.json()

        if (typeof window !== "undefined" && window.MercadoPago) {
          window.MercadoPago.initialize(publicKey)
          setSdkInitialized(true)
        }
      } catch (error) {
        console.error("Error initializing MercadoPago SDK:", error)
      }
    }

    initializeSDK()
  }, [])

  const handleClick = async () => {
    if (showCustomerForm && !showForm) {
      setShowForm(true)
      return
    }

    try {
      const requestBody = {
        title,
        price,
        quantity,
        cartItems: cartItems.length > 0 ? cartItems : null,
        customerInfo: showCustomerForm ? customerInfo : null,
      }

      const response = await fetch("/api/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      setPreferenceId(data.id)

      if (cartItems.length > 0) {
        clearCart()
      }
    } catch (error) {
      console.error("Error creating preference:", error)
    }
  }

  if (!sdkInitialized) {
    return (
      <button disabled className="bg-gray-400 text-white px-6 py-2 rounded-lg font-medium">
        Cargando Mercado Pago...
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {showCustomerForm && showForm && !preferenceId && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium">Información de Envío</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Dirección completa"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              className="px-3 py-2 border rounded-lg md:col-span-2"
              required
            />
          </div>
        </div>
      )}

      {!preferenceId ? (
        <button
          onClick={handleClick}
          disabled={showForm && (!customerInfo.name || !customerInfo.email || !customerInfo.address)}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium w-full"
        >
          {showForm ? "Proceder al Pago" : "Comprar con Mercado Pago"}
        </button>
      ) : (
        <Wallet initialization={{ preferenceId }} />
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Wallet } from "@mercadopago/sdk-react"

interface MercadoPagoButtonProps {
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
    image?: string
    size?: string
    color?: string
  }>
  customerInfo: {
    email: string
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
    phone: string
  }
  shippingCost?: number
  shippingMethod?: string
  onSuccess: (orderId: string) => void
  onError: () => void
}

export function MercadoPagoButton({
  items,
  customerInfo,
  shippingCost = 0,
  shippingMethod = "pickup",
  onSuccess,
  onError,
}: MercadoPagoButtonProps) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [sdkInitialized, setSdkInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  const createPreference = async () => {
    setIsLoading(true)
    try {
      const requestBody = {
        items,
        customerInfo,
        shippingCost,
        shippingMethod,
      }

      const response = await fetch("/api/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error("Error creating preference")
      }

      const data = await response.json()
      setPreferenceId(data.id)
    } catch (error) {
      console.error("Error creating preference:", error)
      onError()
    } finally {
      setIsLoading(false)
    }
  }

  if (!sdkInitialized) {
    return (
      <button disabled className="bg-gray-400 text-white px-6 py-2 rounded-lg font-medium w-full">
        Cargando Mercado Pago...
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {!preferenceId ? (
        <button
          onClick={createPreference}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium w-full"
        >
          {isLoading ? "Procesando..." : "Pagar con MercadoPago"}
        </button>
      ) : (
        <Wallet
          initialization={{ preferenceId }}
          onReady={() => console.log("Wallet ready")}
          onError={(error) => {
            console.error("Wallet error:", error)
            onError()
          }}
        />
      )}
    </div>
  )
}

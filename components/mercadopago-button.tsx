"use client"

import { useState, useEffect } from "react"
import { Wallet, initMercadoPago } from "@mercadopago/sdk-react"

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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        console.log("[v0] Initializing MercadoPago SDK...")
        const response = await fetch("/api/mercadopago/init")

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Failed to get public key:", response.status, errorText)
          throw new Error(`Failed to get public key: ${response.status}`)
        }

        const { publicKey } = await response.json()
        console.log("[v0] Public key received:", publicKey ? "✓" : "✗")

        if (!publicKey) {
          throw new Error("Public key is empty or undefined")
        }

        initMercadoPago(publicKey, {
          locale: "es-AR",
        })

        setSdkInitialized(true)
        console.log("[v0] MercadoPago SDK initialized successfully")
      } catch (error) {
        console.error("[v0] Error initializing MercadoPago SDK:", error)
        setError(`Error al inicializar MercadoPago: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    initializeSDK()
  }, [])

  const createPreference = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Creating MercadoPago preference...")
      const requestBody = {
        items,
        customerInfo,
        shippingCost,
        shippingMethod,
      }

      console.log("[v0] Request body:", requestBody)

      const response = await fetch("/api/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] MercadoPago API error:", response.status, errorText)
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] Preference created successfully:", data.id)
      setPreferenceId(data.id)
    } catch (error) {
      console.error("[v0] Error creating preference:", error)
      setError("Error al crear la preferencia de pago")
      onError()
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <button
          onClick={() => {
            setError(null)
            if (!preferenceId) {
              createPreference()
            }
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium w-full"
        >
          Reintentar
        </button>
      </div>
    )
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
        <div>
          <Wallet
            initialization={{ preferenceId }}
            onReady={() => {
              console.log("[v0] MercadoPago Wallet ready")
            }}
            onError={(error) => {
              console.error("[v0] MercadoPago Wallet error:", error)
              setError("Error en el widget de pago")
              onError()
            }}
          />
        </div>
      )}
    </div>
  )
}

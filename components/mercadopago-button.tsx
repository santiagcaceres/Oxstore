"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Creating MercadoPago preference for redirect...")
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

      if (data.init_point) {
        console.log("[v0] Redirecting to MercadoPago:", data.init_point)
        if (isMobile) {
          window.location.href = data.init_point
        } else {
          window.open(data.init_point, "_blank", "width=800,height=600,scrollbars=yes,resizable=yes")
        }
      } else {
        throw new Error("No se recibió el enlace de pago")
      }
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
            handlePayment()
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium w-full"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium w-full"
    >
      {isLoading ? "Abriendo MercadoPago..." : "Pagar con MercadoPago"}
    </button>
  )
}

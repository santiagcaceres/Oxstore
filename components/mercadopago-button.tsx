"use client"

import { useState, useEffect } from "react"
import { Wallet } from "@mercadopago/sdk-react"

interface MercadoPagoButtonProps {
  title: string
  price: number
  quantity?: number
}

export function MercadoPagoButton({ title, price, quantity = 1 }: MercadoPagoButtonProps) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [sdkInitialized, setSdkInitialized] = useState(false)

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
    try {
      const response = await fetch("/api/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          price,
          quantity,
        }),
      })

      const data = await response.json()
      setPreferenceId(data.id)
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
      {!preferenceId ? (
        <button
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
        >
          Comprar con Mercado Pago
        </button>
      ) : (
        <Wallet initialization={{ preferenceId }} />
      )}
    </div>
  )
}

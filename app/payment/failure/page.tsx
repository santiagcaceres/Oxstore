"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function PaymentFailurePage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Pago Fallido</CardTitle>
          <p className="text-gray-600">Hubo un problema procesando tu pago</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {orderNumber && <p className="text-sm text-gray-600">Pedido: {orderNumber}</p>}
          <p className="text-sm">Por favor, intenta nuevamente o contacta con soporte si el problema persiste.</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.history.back()}>Intentar Nuevamente</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

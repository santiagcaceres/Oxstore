"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useOrder } from "@/context/order-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, ArrowLeft, Download } from "lucide-react"
import Image from "next/image"
import InvoicePDF from "@/components/invoice-pdf"

export default function ConfirmacionPage() {
  const router = useRouter()
  const { state } = useOrder()
  const [isLoading, setIsLoading] = useState(true)
  const [showPDF, setShowPDF] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950"></div>
      </div>
    )
  }

  const order = state.currentOrder
  if (!order) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No se encontró el pedido</h1>
          <Button onClick={() => router.push("/")} className="w-full bg-blue-950 hover:bg-blue-950">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
            <p className="text-gray-600">
              Gracias por tu compra. Tu pedido <span className="font-semibold">{order.id}</span> ha sido procesado.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white">
                    <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-blue-950">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Button>
            <Button onClick={() => setShowPDF(true)} className="w-full bg-blue-950 hover:bg-blue-950">
              <Download className="h-4 w-4 mr-2" />
              Descargar Factura PDF
            </Button>
          </div>
        </div>
      </div>

      {showPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Factura - {order.id}</h3>
              <Button variant="outline" onClick={() => setShowPDF(false)}>
                Cerrar
              </Button>
            </div>
            <div className="p-4 overflow-auto">
              <InvoicePDF order={order} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Printer, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  shipping_method: string
  total_amount: number
  shipping_cost: number
  created_at: string
  order_items: Array<{
    product_name: string
    quantity: number
    size?: string
    color?: string
  }>
}

export default function ShippingLabelPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [params.id])

  const loadOrder = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            size,
            color
          )
        `)
        .eq("id", params.id)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.error("Error loading order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return <div className="p-8">Cargando...</div>
  }

  if (!order || order.shipping_method === "pickup") {
    return (
      <div className="p-8">
        <p>Esta orden no requiere etiqueta de envío (retiro en sucursal)</p>
        <Link href="/admin/pedidos">
          <Button variant="outline" className="mt-4 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pedidos
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden p-4 border-b">
        <div className="flex items-center justify-between">
          <Link href="/admin/pedidos">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Pedidos
            </Button>
          </Link>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Etiqueta
          </Button>
        </div>
      </div>

      {/* Shipping Label */}
      <div className="p-8 max-w-4xl mx-auto">
        <div className="border-2 border-black p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">OXSTORE</h1>
            <p className="text-sm">Etiqueta de Envío</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* From */}
            <div>
              <h3 className="font-bold text-lg mb-2">REMITENTE:</h3>
              <div className="text-sm space-y-1">
                <p className="font-semibold">OXSTORE</p>
                <p>Av. Principal 123</p>
                <p>Ciudad, Provincia</p>
                <p>CP: 1234</p>
                <p>Tel: (011) 1234-5678</p>
              </div>
            </div>

            {/* To */}
            <div>
              <h3 className="font-bold text-lg mb-2">DESTINATARIO:</h3>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{order.customer_name}</p>
                <p>{order.shipping_address}</p>
                <p>Tel: {order.customer_phone}</p>
                <p>Email: {order.customer_email}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Order Details */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">DETALLES DEL PEDIDO:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <span className="font-semibold">Número de Orden:</span> {order.order_number}
                </p>
                <p>
                  <span className="font-semibold">Fecha:</span> {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-semibold">Total:</span> ${order.total_amount.toFixed(2)}
                </p>
                <p>
                  <span className="font-semibold">Costo de Envío:</span> ${order.shipping_cost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">PRODUCTOS:</h3>
            <div className="space-y-1 text-sm">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.product_name}
                    {item.size && ` - Talla: ${item.size}`}
                    {item.color && ` - Color: ${item.color}`}
                  </span>
                  <span>Cant: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Barcode Area */}
          <div className="text-center border-2 border-dashed border-gray-300 p-4">
            <p className="text-lg font-mono">{order.order_number}</p>
            <p className="text-xs text-gray-500 mt-2">Código de seguimiento</p>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-xs text-gray-600">
            <p>• Manipular con cuidado</p>
            <p>• Entregar en horario comercial</p>
            <p>• Contactar al destinatario antes de la entrega</p>
          </div>
        </div>
      </div>
    </div>
  )
}

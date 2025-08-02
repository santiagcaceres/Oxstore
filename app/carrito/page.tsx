"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"

export default function CartPage() {
  const { state, dispatch } = useCart()

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  if (state.items.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-8">¡Agrega algunos productos increíbles!</p>
          <Link href="/">
            <Button className="bg-blue-900 hover:bg-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items del carrito */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-blue-900 font-bold">${item.price}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 mt-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido */}
          <div className="bg-white rounded-lg p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Subtotal ({state.itemCount} items)</span>
                <span>${state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${state.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link href="/checkout">
              <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3" size="lg">
                Proceder al Pago
              </Button>
            </Link>

            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Envío gratis en compras mayores a $100</p>
              <p>Devoluciones gratuitas por 30 días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

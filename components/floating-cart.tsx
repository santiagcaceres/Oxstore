"use client"

import { useState } from "react"
import { ShoppingBag, X, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import Image from "next/image"
import Link from "next/link"

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false)
  const { state, updateQuantity, removeItem } = useCart()

  if (state.itemCount === 0) return null

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <ShoppingBag className="h-6 w-6" />
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
            {state.itemCount}
          </Badge>
        </Button>
      </div>

      {/* Cart Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl animate-slide-in-right">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold">Tu Carrito ({state.itemCount})</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 border-b pb-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
                        <p className="text-sm font-bold">${item.price}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t p-4 space-y-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${state.total.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                    <Link href="/carrito">Ver Carrito Completo</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent" onClick={() => setIsOpen(false)}>
                    <Link href="/checkout">Finalizar Compra</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

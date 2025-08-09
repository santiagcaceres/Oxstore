import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/cart-context"
import { OrderProvider } from "@/context/order-context"
import { ConditionalLayout } from "@/components/conditional-layout"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OX Store - Tienda Online",
  description: "La mejor tienda online de ropa y accesorios",
  icons: {
    icon: "/favicon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>
          <OrderProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <Toaster />
          </OrderProvider>
        </CartProvider>
      </body>
    </html>
  )
}

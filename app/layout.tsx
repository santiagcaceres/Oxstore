import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/cart-context"
import { AdminProvider } from "@/context/admin-context"
import { OrderProvider } from "@/context/order-context"
import ConditionalLayout from "@/components/conditional-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OXSTORE - Moda y Estilo",
  description: "Descubre las últimas tendencias en moda. Ropa de calidad para hombre y mujer.",
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
          <AdminProvider>
            <OrderProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </OrderProvider>
          </AdminProvider>
        </CartProvider>
      </body>
    </html>
  )
}

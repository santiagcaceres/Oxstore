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
  title: "OXSTORE - Tienda de Ropa Online",
  description: "La mejor tienda de ropa online con las últimas tendencias en moda",
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
        <AdminProvider>
          <CartProvider>
            <OrderProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </OrderProvider>
          </CartProvider>
        </AdminProvider>
      </body>
    </html>
  )
}

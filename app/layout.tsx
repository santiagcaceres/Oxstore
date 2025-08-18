import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/cart-context"
import { AdminProvider } from "@/context/admin-context"
import { SimpleAdminProvider } from "@/context/simple-admin-context"
import { AuthProvider } from "@/context/auth-context"
import { OrderProvider } from "@/context/order-context"
import { ThemeProvider } from "@/components/theme-provider"
import ConditionalLayout from "@/components/conditional-layout"
import PopupBanner from "@/components/popup-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OX Store - Tienda Online Uruguay",
  description: "La mejor tienda online de Uruguay. Ropa y accesorios de calidad con envío a todo el país.",
  icons: {
    icon: "/favicon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SimpleAdminProvider>
            <AdminProvider>
              <AuthProvider>
                <CartProvider>
                  <OrderProvider>
                    <ConditionalLayout>{children}</ConditionalLayout>
                    <PopupBanner />
                  </OrderProvider>
                </CartProvider>
              </AuthProvider>
            </AdminProvider>
          </SimpleAdminProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

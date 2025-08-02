"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // No mostrar header y footer en rutas de admin
  const isAdminRoute = pathname?.startsWith("/admin")

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

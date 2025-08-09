"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Solo mostrar header en la página principal
  const showHeader = pathname === "/"

  // No mostrar footer en páginas de admin
  const showFooter = !pathname.startsWith("/admin")

  return (
    <>
      {showHeader && <Header />}
      <main className={showHeader ? "pt-[104px]" : ""}>{children}</main>
      {showFooter && <Footer />}
    </>
  )
}

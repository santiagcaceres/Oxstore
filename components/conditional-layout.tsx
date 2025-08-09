"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Header from "./header"
import Footer from "./footer"

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Don't show header/footer on admin pages
  const isAdminPage = pathname.startsWith("/admin")

  // Only show header on home page
  const isHomePage = pathname === "/"

  return (
    <>
      {!isAdminPage && isHomePage && <Header />}
      <main className={!isAdminPage && isHomePage ? "pt-0" : ""}>{children}</main>
      {!isAdminPage && <Footer />}
    </>
  )
}

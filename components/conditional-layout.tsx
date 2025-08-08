"use client"

import { usePathname } from "next/navigation"
import Header from "./header"
import Footer from "./footer"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Only show header on home page
  const showHeader = pathname === "/"
  
  // Don't show footer on admin pages
  const showFooter = !pathname.startsWith("/admin")

  return (
    <>
      {showHeader && <Header />}
      <main className={showHeader ? "pt-[104px]" : ""}>
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  )
}

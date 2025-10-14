import type React from "react"
import { requireAdmin } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Require admin authentication
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

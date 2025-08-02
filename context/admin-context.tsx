"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin" | "manager"
}

interface AdminContextType {
  user: AdminUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)

  const login = async (email: string, password: string): Promise<boolean> => {
    // En producción, esto sería una llamada real a tu API
    if (email === "admin@oxstore.uy" && password === "admin123") {
      const userData = {
        id: "1",
        email: "admin@oxstore.uy",
        name: "Administrador OXSTORE",
        role: "admin" as const,
      }
      setUser(userData)
      localStorage.setItem("oxstore_admin_token", "authenticated")
      localStorage.setItem("oxstore_admin_user", JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("oxstore_admin_token")
    localStorage.removeItem("oxstore_admin_user")
  }

  return (
    <AdminContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider")
  }
  return context
}

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin" | "manager"
}

interface AdminContextType {
  user: AdminUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("oxstore_admin_token")
    const userData = localStorage.getItem("oxstore_admin_user")

    if (token === "authenticated" && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("oxstore_admin_token")
        localStorage.removeItem("oxstore_admin_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple authentication - in production, this would be a real API call
    if (email === "admin@oxstore.com" && password === "admin123") {
      const userData: AdminUser = {
        id: "1",
        email: "admin@oxstore.com",
        name: "Administrador",
        role: "admin",
      }

      localStorage.setItem("oxstore_admin_token", "authenticated")
      localStorage.setItem("oxstore_admin_user", JSON.stringify(userData))
      setUser(userData)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("oxstore_admin_token")
    localStorage.removeItem("oxstore_admin_user")
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}

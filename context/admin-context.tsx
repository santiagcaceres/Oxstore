"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AdminContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  loading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedAuth = localStorage.getItem("admin_authenticated")
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    // Credenciales de prueba
    if (email === "admin@oxstore.com" && password === "admin123") {
      setIsAuthenticated(true)
      localStorage.setItem("admin_authenticated", "true")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin_authenticated")
  }

  return <AdminContext.Provider value={{ isAuthenticated, login, logout, loading }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}

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
    try {
      const savedAuth = localStorage.getItem("admin_authenticated")
      if (savedAuth === "true") {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      // Si hay error con localStorage, continuar sin autenticación
    }
    setLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    // Credenciales de prueba
    if (email === "admin@oxstore.com" && password === "admin123") {
      setIsAuthenticated(true)
      try {
        localStorage.setItem("admin_authenticated", "true")
      } catch (error) {
        console.error("Error saving to localStorage:", error)
        // Continuar aunque no se pueda guardar en localStorage
      }
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    try {
      localStorage.removeItem("admin_authenticated")
    } catch (error) {
      console.error("Error removing from localStorage:", error)
      // Continuar aunque no se pueda limpiar localStorage
    }
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

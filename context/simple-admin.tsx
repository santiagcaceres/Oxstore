"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AdminContextType {
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function SimpleAdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const adminSession = localStorage.getItem("admin-session")
    if (adminSession === "authenticated") {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = (email: string, password: string): boolean => {
    if (email === "admin@oxstore.com" && password === "admin123") {
      setIsAuthenticated(true)
      localStorage.setItem("admin-session", "authenticated")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin-session")
  }

  return <AdminContext.Provider value={{ isAuthenticated, loading, login, logout }}>{children}</AdminContext.Provider>
}

export function useSimpleAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useSimpleAdmin must be used within a SimpleAdminProvider")
  }
  return context
}

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AdminContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  loading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const VALID_ADMINS = ["mariela@oxstore.com", "patricia@oxstore.com", "alison@oxstore.com", "lorenzo@oxstore.com"]

const ADMIN_PASSWORD = "admin123"

export function SimpleAdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const adminSession = localStorage.getItem("admin-session")
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession)
        if (session.email && VALID_ADMINS.includes(session.email)) {
          setIsAuthenticated(true)
        }
      } catch (error) {
        localStorage.removeItem("admin-session")
      }
    }
    setLoading(false)
  }, [])

  const login = (email: string, password: string): boolean => {
    if (VALID_ADMINS.includes(email) && password === ADMIN_PASSWORD) {
      localStorage.setItem("admin-session", JSON.stringify({ email, timestamp: Date.now() }))
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("admin-session")
    setIsAuthenticated(false)
  }

  return <AdminContext.Provider value={{ isAuthenticated, login, logout, loading }}>{children}</AdminContext.Provider>
}

export function useSimpleAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useSimpleAdmin must be used within a SimpleAdminProvider")
  }
  return context
}

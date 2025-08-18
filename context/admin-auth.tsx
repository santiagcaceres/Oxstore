"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AdminAuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  loading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const VALID_ADMINS = ["mariela@oxstore.com", "patricia@oxstore.com", "alison@oxstore.com", "lorenzo@oxstore.com"]

const ADMIN_PASSWORD = "admin123"

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const adminSession = localStorage.getItem("admin-session")
    if (adminSession) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = (email: string, password: string): boolean => {
    if (VALID_ADMINS.includes(email) && password === ADMIN_PASSWORD) {
      localStorage.setItem("admin-session", email)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("admin-session")
    setIsAuthenticated(false)
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}

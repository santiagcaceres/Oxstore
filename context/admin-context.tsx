"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AdminContextType {
  isAuthenticated: boolean
  user: { email: string } | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const ADMIN_CREDENTIALS = [
  { email: "mariela@oxstore.com", password: "admin123" },
  { email: "patricia@oxstore.com", password: "admin123" },
  { email: "alison@oxstore.com", password: "admin123" },
  { email: "lorenzo@oxstore.com", password: "admin123" },
]

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedSession = localStorage.getItem("admin_session")
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        setIsAuthenticated(true)
        setUser(session.user)
      } catch (error) {
        localStorage.removeItem("admin_session")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const validCredential = ADMIN_CREDENTIALS.find((cred) => cred.email === email && cred.password === password)

    if (validCredential) {
      const session = { user: { email } }
      localStorage.setItem("admin_session", JSON.stringify(session))
      setIsAuthenticated(true)
      setUser({ email })
      return true
    }

    return false
  }

  const logout = async (): Promise<void> => {
    localStorage.removeItem("admin_session")
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AdminContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>{children}</AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}

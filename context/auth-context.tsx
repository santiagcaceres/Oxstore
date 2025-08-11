"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase, getCurrentUser, loginUser, createUser, logoutUser } from "@/lib/supabase"

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  city?: string
  department?: string
  postal_code?: string
  document_type?: string
  document_number?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, userData: any) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener usuario actual al cargar
    getCurrentUser().then((currentUser) => {
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email || "",
          first_name: currentUser.user_metadata?.first_name,
          last_name: currentUser.user_metadata?.last_name,
          phone: currentUser.user_metadata?.phone,
          address: currentUser.user_metadata?.address,
          city: currentUser.user_metadata?.city,
          department: currentUser.user_metadata?.department,
          postal_code: currentUser.user_metadata?.postal_code,
          document_type: currentUser.user_metadata?.document_type,
          document_number: currentUser.user_metadata?.document_number,
        })
      }
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            first_name: session.user.user_metadata?.first_name,
            last_name: session.user.user_metadata?.last_name,
            phone: session.user.user_metadata?.phone,
            address: session.user.user_metadata?.address,
            city: session.user.user_metadata?.city,
            department: session.user.user_metadata?.department,
            postal_code: session.user.user_metadata?.postal_code,
            document_type: session.user.user_metadata?.document_type,
            document_number: session.user.user_metadata?.document_number,
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { user: authUser } = await loginUser(email, password)
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          first_name: authUser.user_metadata?.first_name,
          last_name: authUser.user_metadata?.last_name,
          phone: authUser.user_metadata?.phone,
          address: authUser.user_metadata?.address,
          city: authUser.user_metadata?.city,
          department: authUser.user_metadata?.department,
          postal_code: authUser.user_metadata?.postal_code,
          document_type: authUser.user_metadata?.document_type,
          document_number: authUser.user_metadata?.document_number,
        })
      }
    } catch (error) {
      console.error("Error logging in:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, userData: any) => {
    setLoading(true)
    try {
      await createUser(email, password, userData)
      // El usuario se establecerá automáticamente a través del listener
    } catch (error) {
      console.error("Error registering:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await logoutUser()
      setUser(null)
    } catch (error) {
      console.error("Error logging out:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    if (!user) return

    try {
      // Actualizar en Supabase Auth
      if (supabase) {
        await supabase.auth.updateUser({
          data: updates,
        })
      }

      // Actualizar estado local
      setUser((prev) => (prev ? { ...prev, ...updates } : null))
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

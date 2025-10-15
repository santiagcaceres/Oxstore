"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Popup } from "@/components/ui/popup"
import { AlertCircle } from "lucide-react"

function LoginContent() {
  const searchParams = useSearchParams()
  const verified = searchParams.get("verified")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (verified === "true") {
      // Mantener el toast para mensajes de éxito
    }
  }, [verified])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("is_verified")
        .eq("id", authData.user.id)
        .single()

      if (profileError) throw profileError

      if (!profile.is_verified) {
        setErrorMessage("Por favor, verifica tu email antes de continuar")
        setShowErrorPopup(true)
        setTimeout(() => {
          router.push(`/auth/verificar?email=${encodeURIComponent(email)}`)
        }, 2000)
        return
      }

      router.push("/cuenta")
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Credenciales incorrectas")
      setShowErrorPopup(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">INICIAR SESIÓN</CardTitle>
            <CardDescription>Ingresa tu email y contraseña para acceder a tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">EMAIL</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">CONTRASEÑA</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "INICIANDO SESIÓN..." : "INICIAR SESIÓN"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="/auth/registro" className="underline underline-offset-4 font-medium">
                REGÍSTRATE
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Popup isOpen={showErrorPopup} onClose={() => setShowErrorPopup(false)} title="Error al iniciar sesión">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Button onClick={() => setShowErrorPopup(false)} className="w-full">
            Entendido
          </Button>
        </div>
      </Popup>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  )
}

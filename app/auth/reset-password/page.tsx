"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Popup } from "@/components/ui/popup"
import { AlertCircle, CheckCircle, Lock } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isValidToken, setIsValidToken] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setIsValidToken(true)
      } else {
        setErrorMessage("El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.")
        setShowErrorPopup(true)
      }
    }

    checkSession()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden. Por favor, verifica que ambas sean iguales.")
      setShowErrorPopup(true)
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.")
      setShowErrorPopup(true)
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setErrorMessage(error.message)
        setShowErrorPopup(true)
        setIsLoading(false)
        return
      }

      setShowSuccessPopup(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: unknown) {
      console.error("[v0] Error en reset password:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, intenta nuevamente.")
      setShowErrorPopup(true)
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Enlace Inválido</CardTitle>
            <CardDescription>El enlace de recuperación es inválido o ha expirado</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/forgot-password")} className="w-full">
              Solicitar Nuevo Enlace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">RESTABLECER CONTRASEÑA</CardTitle>
            <CardDescription>Ingresa tu nueva contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">NUEVA CONTRASEÑA</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "ACTUALIZANDO..." : "ACTUALIZAR CONTRASEÑA"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Popup isOpen={showErrorPopup} onClose={() => setShowErrorPopup(false)} title="Error">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 leading-relaxed">{errorMessage}</p>
          </div>
          <Button onClick={() => setShowErrorPopup(false)} className="w-full">
            Entendido
          </Button>
        </div>
      </Popup>

      <Popup isOpen={showSuccessPopup} onClose={() => {}} title="¡Contraseña actualizada!">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800 leading-relaxed">
              Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión en unos segundos.
            </p>
          </div>
        </div>
      </Popup>
    </div>
  )
}

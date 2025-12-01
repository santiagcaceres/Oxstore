"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Popup } from "@/components/ui/popup"
import { AlertCircle, CheckCircle, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setErrorMessage(error.message)
        setShowErrorPopup(true)
        setIsLoading(false)
        return
      }

      setShowSuccessPopup(true)
      setIsLoading(false)
    } catch (error: unknown) {
      console.error("[v0] Error en reset password:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, intenta nuevamente.")
      setShowErrorPopup(true)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">¿OLVIDASTE TU CONTRASEÑA?</CardTitle>
            <CardDescription>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "ENVIANDO..." : "ENVIAR ENLACE DE RECUPERACIÓN"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
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

      <Popup isOpen={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} title="¡Email enviado!">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800 leading-relaxed">
              Te hemos enviado un email con un enlace para restablecer tu contraseña. Por favor, revisa tu bandeja de
              entrada y sigue las instrucciones.
            </p>
          </div>
          <Button onClick={() => setShowSuccessPopup(false)} className="w-full">
            Entendido
          </Button>
        </div>
      </Popup>
    </div>
  )
}

"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Popup } from "@/components/ui/popup"
import { AlertCircle, CheckCircle, Mail } from "lucide-react"

function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: profiles, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, verification_code, verification_code_expires_at, is_verified")
        .eq("email", email)

      if (profileError || !profiles || profiles.length === 0) {
        setErrorMessage("No se encontró una cuenta con este email. Por favor, verifica que el email sea correcto.")
        setShowErrorPopup(true)
        setIsLoading(false)
        return
      }

      const profile = profiles[0]

      if (profile.is_verified) {
        setErrorMessage("Esta cuenta ya ha sido verificada. Puedes iniciar sesión directamente.")
        setShowErrorPopup(true)
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
        return
      }

      if (profile.verification_code !== code) {
        setErrorMessage("El código ingresado es incorrecto. Por favor, verifica el código y vuelve a intentarlo.")
        setShowErrorPopup(true)
        setIsLoading(false)
        return
      }

      if (new Date(profile.verification_code_expires_at) < new Date()) {
        setErrorMessage(
          "El código ha expirado. Por favor, solicita un nuevo código haciendo clic en 'Reenviar código'.",
        )
        setShowErrorPopup(true)
        setIsLoading(false)
        return
      }

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          verification_code: null,
          verification_code_expires_at: null,
        })
        .eq("id", profile.id)

      if (updateError) {
        setErrorMessage("Error al verificar tu cuenta. Por favor, intenta nuevamente.")
        setShowErrorPopup(true)
        setIsLoading(false)
        return
      }

      router.push("/auth/login?verified=true")
    } catch (error: unknown) {
      console.error("[v0] Error en verificación:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, intenta nuevamente.")
      setShowErrorPopup(true)
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)

    try {
      const supabase = createClient()

      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

      const { data: profiles } = await supabase.from("user_profiles").select("id").eq("email", email)

      if (!profiles || profiles.length === 0) {
        setErrorMessage("No se encontró una cuenta con este email.")
        setShowErrorPopup(true)
        setIsResending(false)
        return
      }

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          verification_code: code,
          verification_code_expires_at: expiresAt.toISOString(),
        })
        .eq("id", profiles[0].id)

      if (updateError) {
        setErrorMessage("Error al generar nuevo código. Por favor, intenta nuevamente.")
        setShowErrorPopup(true)
        setIsResending(false)
        return
      }

      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      if (!response.ok) {
        setErrorMessage("Error al enviar el código. Por favor, intenta nuevamente.")
        setShowErrorPopup(true)
        setIsResending(false)
        return
      }

      setSuccessMessage("Código reenviado exitosamente. Por favor, revisa tu email.")
      setShowSuccessPopup(true)
    } catch (error: unknown) {
      console.error("[v0] Error reenviando código:", error)
      setErrorMessage("Ocurrió un error al reenviar el código. Por favor, intenta nuevamente.")
      setShowErrorPopup(true)
    } finally {
      setIsResending(false)
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
            <CardTitle className="text-2xl font-bold">VERIFICAR EMAIL</CardTitle>
            <CardDescription>
              Hemos enviado un código de 6 dígitos a <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">CÓDIGO DE VERIFICACIÓN</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground text-center">El código expira en 15 minutos</p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                {isLoading ? "VERIFICANDO..." : "VERIFICAR CÓDIGO"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" onClick={handleResendCode} disabled={isResending} className="text-sm">
                {isResending ? "Enviando..." : "¿No recibiste el código? Reenviar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Popup isOpen={showErrorPopup} onClose={() => setShowErrorPopup(false)} title="Error al verificar">
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

      <Popup isOpen={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} title="Código reenviado">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800 leading-relaxed">{successMessage}</p>
          </div>
          <Button onClick={() => setShowSuccessPopup(false)} className="w-full">
            Continuar
          </Button>
        </div>
      </Popup>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyContent />
    </Suspense>
  )
}

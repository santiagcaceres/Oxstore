"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { toast } from "@/hooks/use-toast"

function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, verification_code, verification_code_expires_at, is_verified")
        .eq("email", email)
        .single()

      if (profileError) throw new Error("No se pudo verificar el código")

      if (profile.verification_code !== code) {
        throw new Error("Código incorrecto")
      }

      if (new Date(profile.verification_code_expires_at) < new Date()) {
        throw new Error("El código ha expirado. Solicita uno nuevo.")
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

      if (updateError) throw updateError

      toast({
        title: "Email verificado",
        description: "Tu cuenta ha sido verificada exitosamente",
      })

      router.push("/auth/login?verified=true")
    } catch (error: unknown) {
      toast({
        title: "Error al verificar",
        description: error instanceof Error ? error.message : "Ocurrió un error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)

    try {
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error("Error enviando código")
      }

      toast({
        title: "Código reenviado",
        description: "Se ha enviado un nuevo código a tu email",
      })
    } catch (error: unknown) {
      toast({
        title: "Error al reenviar código",
        description: error instanceof Error ? error.message : "Ocurrió un error",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">VERIFICAR EMAIL</CardTitle>
            <CardDescription>
              Hemos enviado un código de 6 dígitos a <strong>{email}</strong>
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
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground">El código expira en 15 minutos</p>
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

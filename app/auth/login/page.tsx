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
import { toast } from "@/hooks/use-toast"

function LoginContent() {
  const searchParams = useSearchParams()
  const verified = searchParams.get("verified")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (verified === "true") {
      toast({
        title: "Email verificado",
        description: "¡Email verificado exitosamente! Ahora puedes iniciar sesión.",
      })
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
        toast({
          title: "Email no verificado",
          description: "Por favor, verifica tu email antes de continuar",
          variant: "destructive",
        })
        router.push(`/auth/verificar?email=${encodeURIComponent(email)}`)
        return
      }

      toast({
        title: "Sesión iniciada",
        description: "Bienvenido de vuelta",
      })
      router.push("/cuenta")
    } catch (error: unknown) {
      toast({
        title: "Error al iniciar sesión",
        description: error instanceof Error ? error.message : "Credenciales incorrectas",
        variant: "destructive",
      })
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

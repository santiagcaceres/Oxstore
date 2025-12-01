"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Popup } from "@/components/ui/popup"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [dni, setDni] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)

    const generatedPassword = Math.random().toString(36).slice(-8) + "Temp123!"

    try {
      const { data: existingUser } = await supabase.from("user_profiles").select("email").eq("email", email).single()

      if (existingUser) {
        setErrorMessage("Este email ya está registrado. Por favor, inicia sesión o usa otro email.")
        setShowErrorPopup(true)
        setIsLoading(false)
        return
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: generatedPassword, // Use generated password
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
            dni,
            address,
            city,
            postal_code: postalCode,
          },
        },
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          setErrorMessage("Este email ya está en uso. Por favor, inicia sesión.")
        } else {
          setErrorMessage(authError.message)
        }
        setShowErrorPopup(true)
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setErrorMessage("Error al crear la cuenta. Por favor, intenta nuevamente.")
        setShowErrorPopup(true)
        setIsLoading(false)
        return
      }

      const { error: profileError } = await supabase.from("user_profiles").upsert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        dni,
        address,
        city,
        postal_code: postalCode,
      })

      if (profileError) {
        console.error("[v0] Error guardando perfil:", profileError)
        setErrorMessage("Error al guardar tu información. Por favor, intenta nuevamente.")
        setShowErrorPopup(true)
        setIsLoading(false)
        return
      }

      try {
        await fetch("/api/auth/send-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, firstName, lastName, password: generatedPassword }),
        })
      } catch (emailError) {
        console.error("[v0] Error sending welcome email:", emailError)
        // Don't block registration if email fails
      }

      setShowSuccessPopup(true)
      setTimeout(() => {
        router.push("/cuenta")
      }, 2000)
    } catch (error: unknown) {
      console.error("[v0] Error en registro:", error)
      setErrorMessage("Ocurrió un error inesperado. Por favor, intenta nuevamente.")
      setShowErrorPopup(true)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">CREAR CUENTA</CardTitle>
            <CardDescription>Completa tus datos para crear una nueva cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">NOMBRE *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">APELLIDO *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Pérez"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">TELÉFONO *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="099 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni">Cédula *</Label>
                  <Input
                    id="dni"
                    type="text"
                    required
                    placeholder="12345678"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">DIRECCIÓN *</Label>
                <Input
                  id="address"
                  type="text"
                  required
                  placeholder="Av. 18 de Julio 1234"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">CIUDAD *</Label>
                  <Input
                    id="city"
                    type="text"
                    required
                    placeholder="Montevideo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">CÓDIGO POSTAL</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    placeholder="11000"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">EMAIL *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Tu contraseña será generada automáticamente y enviada a tu correo electrónico. Podrás cambiarla
                  después desde tu perfil.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "CREANDO CUENTA..." : "CREAR CUENTA"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/auth/login" className="underline underline-offset-4 font-medium">
                INICIAR SESIÓN
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Popup isOpen={showErrorPopup} onClose={() => setShowErrorPopup(false)} title="Error al crear cuenta">
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
      <Popup isOpen={showSuccessPopup} onClose={() => {}} title="¡Cuenta creada exitosamente!">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800 leading-relaxed">
              Tu cuenta ha sido creada correctamente. Te hemos enviado un email con tu contraseña temporal. Serás
              redirigido a tu cuenta en unos segundos.
            </p>
          </div>
        </div>
      </Popup>
    </div>
  )
}

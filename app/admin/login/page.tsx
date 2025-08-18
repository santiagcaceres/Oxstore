"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSimpleAdmin } from "@/context/simple-admin-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useSimpleAdmin()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = login(email, password)
      if (success) {
        router.push("/admin")
      } else {
        setError("Credenciales incorrectas")
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="relative h-12 w-32 mx-auto mb-6">
            <Image src="/logo-oscuro.png" alt="OXSTORE" fill className="object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Panel de Administración</h2>
          <p className="mt-2 text-sm text-gray-600">Ingresa tus credenciales para continuar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Accede al panel de administración</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@oxstore.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-600">
                <strong>Usuarios autorizados:</strong> mariela@oxstore.com, alison@oxstore.com, lorenzo@oxstore.com,
                patricia@oxstore.com
              </p>
              <p className="text-xs text-blue-600 mt-1">
                <strong>Contraseña:</strong> admin123 (para todos los usuarios)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

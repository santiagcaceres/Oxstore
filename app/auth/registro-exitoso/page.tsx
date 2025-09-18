"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail } from "lucide-react"
import Link from "next/link"

export default function Page() {
  const [showConfirmButton, setShowConfirmButton] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfirmButton(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleConfirm = () => {
    setIsConfirmed(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              {isConfirmed ? "¡EMAIL CONFIRMADO!" : "¡REGISTRO EXITOSO!"}
            </CardTitle>
            <CardDescription>
              {isConfirmed ? "Tu cuenta ha sido activada correctamente" : "Revisa tu email para confirmar tu cuenta"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {!isConfirmed ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <Mail className="h-12 w-12 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Te hemos enviado un email de confirmación. Por favor, revisa tu bandeja de entrada y haz clic en el
                  enlace para activar tu cuenta.
                </p>

                {showConfirmButton && (
                  <Button onClick={handleConfirm} className="w-full mb-2" variant="default">
                    Confirmar
                  </Button>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <p className="text-sm text-green-600 font-medium">
                  ¡Perfecto! Tu email ha sido verificado y tu cuenta está activa.
                </p>
              </>
            )}

            <Button asChild className="w-full" variant={isConfirmed ? "default" : "outline"}>
              <Link href="/auth/login">{isConfirmed ? "INICIAR SESIÓN" : "VOLVER AL LOGIN"}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

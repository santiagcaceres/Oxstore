import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">¡REGISTRO EXITOSO!</CardTitle>
            <CardDescription>Revisa tu email para confirmar tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Te hemos enviado un email de confirmación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace
              para activar tu cuenta.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">VOLVER AL LOGIN</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import Link from "next/link"
import { CheckCircle, Package, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function CheckoutExitoPage() {
  const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-24 w-24 mx-auto text-green-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4">¡Pedido Confirmado!</h1>
          <p className="text-muted-foreground mb-8">Gracias por tu compra. Tu pedido ha sido procesado exitosamente.</p>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-left space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Número de Pedido:</span>
                  <span className="font-mono">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Estado:</span>
                  <span className="text-green-600">Confirmado</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tiempo estimado de entrega:</span>
                  <span>3-5 días hábiles</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Preparación</h3>
                <p className="text-sm text-muted-foreground">Tu pedido está siendo preparado</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Envío</h3>
                <p className="text-sm text-muted-foreground">Recibirás un email con el tracking</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Button asChild size="lg">
              <Link href="/productos">Continuar Comprando</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="text-8xl font-bold text-muted-foreground mb-4">404</div>
          <h1 className="text-3xl font-bold mb-4">Página no encontrada</h1>
          <p className="text-muted-foreground mb-8">Lo sentimos, la página que buscas no existe o ha sido movida.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Ir al Inicio
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver Atrás
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

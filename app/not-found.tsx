import { Button } from "@/components/ui/button"
import { ArrowLeft, Palette } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <Image
            src="/images/negro-lucho.png"
            alt="Fulco Logo"
            width={150}
            height={75}
            className="h-12 w-auto mx-auto mb-6"
          />
          <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">La obra que buscas no existe o ha sido movida a otra galería.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
          <Link href="/obras">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-transparent border-black text-black hover:bg-black hover:text-white"
            >
              <Palette className="w-4 h-4 mr-2" />
              Ver Todas las Obras
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

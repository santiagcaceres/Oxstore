import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Información de la tienda */}
          <div>
            <h3 className="text-xl font-bold mb-4">OXSTORE</h3>
            <p className="text-blue-100 mb-4">
              Tu tienda de moda en Santa Lucía. Calidad, estilo y las mejores marcas.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-blue-100 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-blue-100 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-blue-100 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-blue-100">
              <li>
                <Link href="/hombre" className="hover:text-white">
                  Hombre
                </Link>
              </li>
              <li>
                <Link href="/mujer" className="hover:text-white">
                  Mujer
                </Link>
              </li>
              <li>
                <Link href="/accesorios" className="hover:text-white">
                  Accesorios
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="hover:text-white">
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Atención al cliente */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Atención al Cliente</h4>
            <ul className="space-y-2 text-blue-100">
              <li>
                <Link href="/contacto" className="hover:text-white">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/envios" className="hover:text-white">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="hover:text-white">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/tallas" className="hover:text-white">
                  Guía de Tallas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-blue-100">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Santa Lucía, Uruguay</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>+598 1234 5678</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@oxstore.uy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-100 text-sm">© 2024 OXSTORE. Todos los derechos reservados.</p>
          <div className="mt-4 md:mt-0">
            <p className="text-blue-100 text-sm">
              Desarrollado por{" "}
              <Link href="https://launchbyte.dev" className="text-white font-semibold hover:underline" target="_blank">
                Launchbyte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

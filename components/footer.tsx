import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <Image src="/logo-claro.png" alt="OXSTORE" width={120} height={40} className="h-8 w-auto" />
            <p className="text-gray-400 text-sm">
              Tu tienda de moda online. Las mejores marcas y tendencias al mejor precio.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="font-semibold mb-4">Categorías</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/hombre" className="text-gray-400 hover:text-white transition-colors">
                  Hombre
                </Link>
              </li>
              <li>
                <Link href="/mujer" className="text-gray-400 hover:text-white transition-colors">
                  Mujer
                </Link>
              </li>
              <li>
                <Link href="/accesorios" className="text-gray-400 hover:text-white transition-colors">
                  Accesorios
                </Link>
              </li>
              <li>
                <Link href="/nuevo" className="text-gray-400 hover:text-white transition-colors">
                  Nuevo
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="text-gray-400 hover:text-white transition-colors">
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="font-semibold mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ayuda/envios" className="text-gray-400 hover:text-white transition-colors">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="/ayuda/devoluciones" className="text-gray-400 hover:text-white transition-colors">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/ayuda/tallas" className="text-gray-400 hover:text-white transition-colors">
                  Guía de tallas
                </Link>
              </li>
              <li>
                <Link href="/ayuda/contacto" className="text-gray-400 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/ayuda/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>info@oxstore.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+54 11 1234-5678</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 OXSTORE. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

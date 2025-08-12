import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white w-full">
      <div className="w-full px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Logo y descripción - más compacto */}
            <div className="space-y-2">
              <Image src="/logo-claro.png" alt="OXSTORE" width={100} height={32} className="h-5 w-auto" />
              <p className="text-gray-400 text-xs">Moda online. Las mejores marcas al mejor precio.</p>
              <div className="flex space-x-3">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-4 w-4" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-4 w-4" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Categorías */}
              <div>
                <h3 className="font-semibold mb-2 text-sm">Categorías</h3>
                <ul className="space-y-1 text-xs">
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
                </ul>
              </div>

              {/* Ayuda */}
              <div>
                <h3 className="font-semibold mb-2 text-sm">Ayuda</h3>
                <ul className="space-y-1 text-xs">
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
                    <Link href="/ayuda/contacto" className="text-gray-400 hover:text-white transition-colors">
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contacto - más compacto */}
            <div>
              <h3 className="font-semibold mb-2 text-sm">Contacto</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail className="h-3 w-3" />
                  <span>info@oxstore.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone className="h-3 w-3" />
                  <span>+598 99 123 456</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span>Montevideo, Uruguay</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-3 pt-3 text-center text-xs text-gray-400">
            <p>&copy; 2024 OXSTORE. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="space-y-4">
            <Image src="/logo-oxstore.png" alt="Oxstore" width={120} height={40} className="h-6 w-auto" />
            <p className="text-muted-foreground text-sm">
              Tu tienda de confianza para moda y estilo. Calidad garantizada y las mejores marcas.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre-nosotros" className="text-muted-foreground hover:text-primary transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-muted-foreground hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/envios" className="text-muted-foreground hover:text-primary transition-colors">
                  Información de Envíos
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="text-muted-foreground hover:text-primary transition-colors">
                  Devoluciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">Categorías</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categoria/mujer" className="text-muted-foreground hover:text-primary transition-colors">
                  Mujer
                </Link>
              </li>
              <li>
                <Link href="/categoria/hombre" className="text-muted-foreground hover:text-primary transition-colors">
                  Hombre
                </Link>
              </li>
              <li>
                <Link href="/categoria/nina" className="text-muted-foreground hover:text-primary transition-colors">
                  Niña
                </Link>
              </li>
              <li>
                <Link href="/categoria/nino" className="text-muted-foreground hover:text-primary transition-colors">
                  Niño
                </Link>
              </li>
              <li>
                <Link href="/categoria/bebes" className="text-muted-foreground hover:text-primary transition-colors">
                  Bebés
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contacto</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Av. Principal 123, Ciudad</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">+1 234 567 890</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">info@oxstore.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-6 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Oxstore. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

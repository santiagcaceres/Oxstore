import Link from "next/link"
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Us Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Sobre Nosotros</h3>
            <p className="text-sm text-muted-foreground">
              Somos una tienda de ropa comprometida con ofrecer las mejores marcas y tendencias de moda. Calidad, estilo
              y atención personalizada en cada compra.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/productos" className="text-muted-foreground hover:text-primary transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/nuevo" className="text-muted-foreground hover:text-primary transition-colors">
                  Novedades
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="text-muted-foreground hover:text-primary transition-colors">
                  Ofertas
                </Link>
              </li>
              <li>
                <Link href="/sale" className="text-muted-foreground hover:text-primary transition-colors">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Atención al Cliente</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cuenta" className="text-muted-foreground hover:text-primary transition-colors">
                  Mi Cuenta
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-muted-foreground hover:text-primary transition-colors">
                  Carrito
                </Link>
              </li>
              <li>
                <Link href="/buscar" className="text-muted-foreground hover:text-primary transition-colors">
                  Buscar Productos
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a
                  href="https://wa.me/59892152947"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  092 152 947
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@oxstore.com" className="hover:text-primary transition-colors">
                  info@oxstore.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Santa Lucía, Canelones</span>
              </li>
            </ul>
            <div className="flex gap-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Oxstore. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

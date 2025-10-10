import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

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
                <Link
                  href="/categoria/vestimenta"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Vestimenta
                </Link>
              </li>
              <li>
                <Link href="/categoria/calzado" className="text-muted-foreground hover:text-primary transition-colors">
                  Calzado
                </Link>
              </li>
              <li>
                <Link
                  href="/categoria/accesorios"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Accesorios
                </Link>
              </li>
              <li>
                <Link href="/admin/guias-talles" className="text-muted-foreground hover:text-primary transition-colors">
                  Guías de Talles
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
                <span className="text-muted-foreground">Cambios y Devoluciones</span>
              </li>
              <li>
                <span className="text-muted-foreground">Preguntas Frecuentes</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+54 11 1234-5678</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@oxstore.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Buenos Aires, Argentina</span>
              </li>
            </ul>
            <div className="flex gap-4 pt-2">
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

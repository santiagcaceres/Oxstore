# Sistema de Administración - Portfolio Luciano Fulco

## 🔐 SISTEMA DE AUTENTICACIÓN

### Login del Administrador
**Archivo:** `app/admin/login/page.tsx`

**Credenciales por defecto:**
- Email: `luciano.fulco51@hotmail.com`
- Password: `admin123`

**Funcionamiento:**
\`\`\`typescript
// Simulación de login - en producción sería una llamada a API
if (email === "luciano.fulco51@hotmail.com" && password === "admin123") {
  localStorage.setItem("admin-token", "authenticated")
  router.push("/admin/dashboard")
} else {
  setError("Credenciales incorrectas")
}
\`\`\`

**Protección de rutas:**
\`\`\`typescript
useEffect(() => {
  const token = localStorage.getItem("admin-token")
  if (!token) {
    router.push("/admin/login")
  } else {
    setIsAuthenticated(true)
  }
}, [router])
\`\`\`

---

## 📊 DASHBOARD PRINCIPAL

### Archivo: `app/admin/dashboard/page.tsx`

**Estadísticas que muestra:**
- Total de obras
- Obras destacadas
- Número de categorías

**Funciones principales:**
\`\`\`typescript
const loadStats = async () => {
  try {
    const [allArtworks, featuredArtworks] = await Promise.all([
      getArtworks(), 
      getFeaturedArtworks()
    ])
    
    const categories = new Set(allArtworks.map((artwork) => artwork.category))
    
    setStats({
      totalArtworks: allArtworks.length,
      featuredArtworks: featuredArtworks.length,
      categories: categories.size,
    })
  } catch (error) {
    console.error("Error loading stats:", error)
  }
}
\`\`\`

**Acciones rápidas:**
- Crear nueva obra
- Ver todas las obras
- Acceder al sitio público

---

## 🖼️ GESTIÓN DE OBRAS

### Lista de Obras: `app/admin/obras/page.tsx`

**Características:**
- Grid responsivo de obras
- Información de cada obra: título, categoría, precio, estado
- Acciones: Ver, Editar, Eliminar
- Popups de confirmación para acciones exitosas

**Popups de éxito:**
\`\`\`typescript
// Popup para obra creada
{showCreatedPopup && (
  <div className="fixed top-4 right-4 z-[9999]">
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-green-800">¡Obra Creada con Éxito!</p>
            <p className="text-xs text-green-600">"{createdArtworkTitle}" se ha guardado.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
\`\`\`

### Crear Nueva Obra: `app/admin/obras/nueva/page.tsx`

**Campos del formulario:**
- Título de la obra (requerido)
- Categoría (requerido): Óleos, Óleo Pastel, Acrílicos, Técnica Mixta, Acuarelas, Dibujos, Otros
- Checkbox para técnica de espátula
- Precio en USD (requerido)
- Descripción corta (requerida)
- Descripción detallada (opcional)
- Año, dimensiones, técnica
- Estado: Disponible, Vendida, Reservado
- Checkbox para obra destacada
- Subida de imágenes (máximo 3, con optimización automática)

**Validaciones:**
\`\`\`typescript
if (selectedImages.length === 0) {
  setError("Debes seleccionar al menos una imagen.")
  setIsLoading(false)
  return
}
\`\`\`

### Editar Obra: `app/admin/obras/[id]/editar/page.tsx`

**Funcionalidades:**
- Carga datos existentes de la obra
- Muestra imágenes actuales
- Permite reemplazar todas las imágenes
- Mantiene la misma estructura de validación que crear obra

---

## 📸 SISTEMA DE IMÁGENES

### Componente de Subida Simple: `components/simple-image-upload.tsx`

**Características:**
- Drag & drop de imágenes
- Máximo 3 imágenes por obra
- Optimización automática con compresión
- Reordenamiento de imágenes
- La primera imagen se convierte en imagen principal
- Preview en tiempo real

**Compresión de imágenes:**
\`\`\`typescript
// lib/image-compression.ts
export async function compressImage(file: File): Promise<File> {
  // Si el archivo es muy pequeño, no comprimir
  if (file.size < 1024 * 1024) { // Menos de 1MB
    resolve(file)
    return
  }
  
  // Redimensionar a máximo 1200x1200px
  // Comprimir con calidad 80%
  // Mantener aspect ratio
}
\`\`\`

### Galería de Obras: `app/obra/[id]/artwork-gallery.tsx`

**Funcionalidades:**
- Navegación entre múltiples imágenes
- Contador de imágenes
- Botones de navegación (anterior/siguiente)
- Manejo de errores de carga
- Responsive design

---

## 🗄️ ACCIONES DEL SERVIDOR

### Archivo: `app/actions/artworks.ts`

**Funciones principales:**

#### Obtener obras:
\`\`\`typescript
export async function getArtworks() {
  if (!SUPABASE_ENABLED) {
    return SAMPLE_ARTWORKS // Datos de ejemplo
  }
  
  const supabase = createClient()
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .order("created_at", { ascending: false })
    
  return data || SAMPLE_ARTWORKS
}
\`\`\`

#### Crear obra:
\`\`\`typescript
export async function createArtwork(formData: FormData) {
  // 1. Validar imágenes
  // 2. Subir imágenes a Supabase Storage
  // 3. Insertar obra en base de datos
  // 4. Insertar imágenes de galería
  // 5. Revalidar páginas
}
\`\`\`

#### Actualizar obra:
\`\`\`typescript
export async function updateArtwork(id: string, formData: FormData) {
  // 1. Preparar datos de actualización
  // 2. Si hay nuevas imágenes: eliminar antiguas y subir nuevas
  // 3. Actualizar registro en base de datos
  // 4. Revalidar páginas
}
\`\`\`

#### Eliminar obra:
\`\`\`typescript
export async function deleteArtwork(id: string) {
  // 1. Obtener URLs de imágenes
  // 2. Eliminar imágenes del storage
  // 3. Eliminar obra de la base de datos
  // 4. Revalidar páginas
}
\`\`\`

---

## 🎨 FAVICON Y BRANDING

### Configuración de Favicon

**Archivos necesarios:**
\`\`\`
public/
├── favicon.ico
├── favicon.png (512x512)
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png (180x180)
└── site.webmanifest
\`\`\`

**Configuración en layout.tsx:**
\`\`\`typescript
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.png",
  },
  manifest: "/site.webmanifest",
}
\`\`\`

**Web App Manifest (site.webmanifest):**
\`\`\`json
{
  "name": "Luciano Fulco - Artista Visual",
  "short_name": "Luciano Fulco",
  "description": "Portfolio oficial de Luciano Fulco, artista visual uruguayo",
  "icons": [
    {
      "src": "/favicon.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "scope": "/"
}
\`\`\`

---

## ⏳ PANTALLA DE LOADING

### Loading Global: `app/loading.tsx`

\`\`\`typescript
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Image
          src="/images/negro-lucho.png"
          alt="Fulco Logo"
          width={120}
          height={60}
          className="h-10 w-auto mx-auto mb-6 animate-pulse"
        />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
\`\`\`

### Loading con Pantalla de Bienvenida: `app/home-page-client.tsx`

**Pantalla de bienvenida con logo:**
\`\`\`typescript
const [showWelcome, setShowWelcome] = useState(true)
const [isWelcomeFading, setIsWelcomeFading] = useState(false)

useEffect(() => {
  const fadeTimer = setTimeout(() => setIsWelcomeFading(true), 2500)
  const hideTimer = setTimeout(() => setShowWelcome(false), 3500)
  return () => {
    clearTimeout(fadeTimer)
    clearTimeout(hideTimer)
  }
}, [])

// Pantalla de bienvenida
{showWelcome && (
  <div className={`fixed inset-0 bg-black flex flex-col items-center justify-center transition-opacity duration-1000 z-[9999] ${
    isWelcomeFading ? "opacity-0" : "opacity-100"
  }`}>
    <div className="flex-1 flex items-center justify-center">
      <Image
        src="/images/blanco-lucho.png"
        alt="Fulco Logo"
        width={180}
        height={90}
        className="animate-pulse"
        priority
      />
    </div>
    <div className="pb-8 flex items-center gap-2">
      <span className="text-white text-xs opacity-60">Powered by</span>
      <Image
        src="/images/launchbyte-logo.png"
        alt="LaunchByte Logo"
        width={20}
        height={20}
        className="brightness-0 invert"
      />
      <span className="text-white text-xs opacity-60 font-medium">LaunchByte</span>
    </div>
  </div>
)}
\`\`\`

---

## 🦶 FOOTER

### Footer Principal: `app/home-page-client.tsx`

\`\`\`typescript
<footer className="bg-black/90 backdrop-blur-sm text-white py-8 relative">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Image
          src="/images/launchbyte-logo.png"
          alt="LaunchByte Logo"
          width={32}
          height={32}
          className="brightness-0 invert"
        />
        <span className="text-lg font-semibold">LaunchByte</span>
      </div>
      <div className="text-center md:text-right">
        <p className="text-sm text-gray-300">
          &copy; 2025 LaunchByte. Todos los derechos reservados.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Desarrollo web profesional
        </p>
      </div>
    </div>
  </div>
</footer>
\`\`\`

**Características del footer:**
- Fondo negro semi-transparente con backdrop-blur
- Logo de LaunchByte con efecto invert para hacerlo blanco
- Copyright dinámico con año actual
- Responsive: columna en móvil, fila en desktop
- Texto descriptivo sobre el servicio

---

## 🎯 PÁGINAS DE ERROR

### 404 Not Found: `app/not-found.tsx`

\`\`\`typescript
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
        <p className="text-gray-600 mb-8">
          La obra que buscas no existe o ha sido movida a otra galería.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
          <Link href="/obras">
            <Button variant="outline" className="w-full sm:w-auto bg-transparent border-black text-black hover:bg-black hover:text-white">
              <Palette className="w-4 h-4 mr-2" />
              Ver Todas las Obras
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
\`\`\`

---

## 🔧 CONFIGURACIONES TÉCNICAS

### Tailwind Config: `tailwind.config.ts`

**Colores personalizados:**
\`\`\`typescript
colors: {
  sidebar: {
    DEFAULT: "hsl(var(--sidebar-background))",
    foreground: "hsl(var(--sidebar-foreground))",
    primary: "hsl(var(--sidebar-primary))",
    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
    accent: "hsl(var(--sidebar-accent))",
    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
    border: "hsl(var(--sidebar-border))",
    ring: "hsl(var(--sidebar-ring))",
  },
}
\`\`\`

**Fuentes personalizadas:**
\`\`\`typescript
fontFamily: {
  "serif-display": ["var(--font-playfair-display)"],
},
\`\`\`

### CSS Global: `app/globals.css`

**Variables CSS para temas:**
\`\`\`css
:root {
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 240 5.9% 10%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 240 4.8% 95.9%;
  --sidebar-accent-foreground: 240 5.9% 10%;
  --sidebar-border: 220 13% 91%;
  --sidebar-ring: 217.2 91.2% 59.8%;
}
\`\`\`

**Utilidades personalizadas:**
\`\`\`css
/* Ocultar scrollbar pero mantener funcionalidad */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
\`\`\`

---

## 📱 RESPONSIVE DESIGN

### Breakpoints utilizados:
- **sm:** 640px (móviles grandes)
- **md:** 768px (tablets)
- **lg:** 1024px (laptops)
- **xl:** 1280px (desktops)

### Patrones responsive comunes:
\`\`\`typescript
// Grid responsive
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"

// Flex responsive
className="flex flex-col sm:flex-row gap-4"

// Texto responsive
className="text-sm md:text-base lg:text-lg"

// Espaciado responsive
className="p-4 md:p-6 lg:p-8"
\`\`\`

---

## 🚀 OPTIMIZACIONES DE RENDIMIENTO

### Imágenes:
- Uso de `next/image` con optimización automática
- Lazy loading por defecto
- Sizes attribute para responsive images
- Compresión automática de imágenes subidas

### Carga:
- Componentes de loading para mejor UX
- Suspense boundaries
- Error boundaries para manejo de errores

### SEO:
- Metadata dinámico por página
- Open Graph tags
- Structured data
- Sitemap automático

---

## 🔒 SEGURIDAD

### Autenticación:
- Token en localStorage (para demo)
- Protección de rutas administrativas
- Validación en cliente y servidor

### Datos:
- Validación de formularios
- Sanitización de inputs
- Manejo seguro de archivos

---

Esta documentación cubre todos los aspectos técnicos del sistema de administración, configuración de favicon, pantallas de loading y footer del portfolio de Luciano Fulco.

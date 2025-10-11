# Luciano Fulco - Portfolio de Arte

Portfolio web profesional para el artista visual uruguayo Luciano Fulco, desarrollado con Next.js 14, Supabase y Tailwind CSS.

## 🎨 Características

- **Portfolio Dinámico**: Gestión completa de obras de arte
- **Panel de Administración**: CRUD completo para obras
- **Base de Datos**: Supabase con almacenamiento de imágenes
- **Responsive**: Optimizado para todos los dispositivos
- **SEO Optimizado**: Meta tags y estructura semántica
- **Performance**: Optimización de imágenes y carga

## 🚀 Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Storage)
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📦 Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd luciano-fulco-portfolio
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Completar con tus credenciales de Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. **Ejecutar scripts de base de datos**
Ejecutar en orden en el SQL Editor de Supabase:
- `scripts/01-create-tables.sql`
- `scripts/02-setup-database.sql`
- `scripts/03-create-storage-bucket.sql`

5. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

## 🗄️ Estructura de la Base de Datos

### Tabla `artworks`
- `id` (UUID, PK)
- `title` (TEXT)
- `category` (TEXT)
- `subcategory` (TEXT, opcional)
- `price` (INTEGER)
- `description` (TEXT)
- `detailed_description` (TEXT, opcional)
- `year` (INTEGER, opcional)
- `dimensions` (TEXT, opcional)
- `technique` (TEXT, opcional)
- `status` (TEXT, default: 'Disponible')
- `featured` (BOOLEAN, default: false)
- `main_image_url` (TEXT, opcional)
- `created_at` (TIMESTAMPTZ)

### Tabla `artwork_images`
- `id` (UUID, PK)
- `artwork_id` (UUID, FK)
- `image_url` (TEXT)
- `created_at` (TIMESTAMPTZ)

### Storage Bucket `artworks`
- Almacenamiento público de imágenes
- Políticas de acceso configuradas

## 🔐 Panel de Administración

**URL**: `/admin/login`
**Credenciales por defecto**:
- Email: `luciano.fulco51@hotmail.com`
- Password: `admin123`

### Funcionalidades:
- ✅ Crear nuevas obras
- ✅ Editar obras existentes
- ✅ Eliminar obras
- ✅ Marcar obras como destacadas
- ✅ Gestión de imágenes
- ✅ Estadísticas del portfolio

## 🌐 Páginas Públicas

- **Home** (`/`): Landing page con obras destacadas
- **Obras** (`/obras`): Galería completa con filtros
- **Detalle de Obra** (`/obra/[id]`): Vista individual
- **Landing Page** (`/landing`): Página de presentación

## 📱 Responsive Design

- **Mobile First**: Optimizado para móviles
- **Tablet**: Adaptación para tablets
- **Desktop**: Experiencia completa en escritorio

## 🔧 Configuración de Supabase

1. **Crear proyecto en Supabase**
2. **Ejecutar scripts SQL** en orden
3. **Configurar Storage** para imágenes
4. **Obtener credenciales** del proyecto
5. **Configurar variables de entorno**

## 🚀 Deploy en Vercel

1. **Conectar repositorio** en Vercel
2. **Configurar variables de entorno**
3. **Deploy automático** desde main branch

## 📧 Contacto

- **Email**: luciano.fulco51@hotmail.com
- **WhatsApp**: +598 98 059 079

## 🏢 Desarrollado por

**LaunchByte** - Desarrollo web profesional para artistas

---

© 2025 LaunchByte. Todos los derechos reservados.

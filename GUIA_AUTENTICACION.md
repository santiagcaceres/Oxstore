# 📧 Guía Completa: Autenticación con Verificación por Email

## 🎯 Paso 1: Ejecutar el Script SQL

**IMPORTANTE: Este es el primer paso obligatorio**

1. En v0, busca la sección **"Scripts"** en la barra lateral izquierda
2. Encuentra el script `45-setup-user-authentication.sql`
3. Haz clic en el botón **"Run Script"**
4. Espera el mensaje: ✅ "Script ejecutado exitosamente"

**¿Qué hace este script?**
- ✅ Crea la tabla `user_profiles` con campos: nombre, apellido, teléfono, dirección, ciudad, código postal, DNI
- ✅ Crea un trigger automático que genera un perfil cuando un usuario se registra
- ✅ Habilita Row Level Security (RLS) para proteger los datos
- ✅ Actualiza `cart_items` y `orders` para usar UUID de Supabase Auth
- ✅ Crea políticas de seguridad: cada usuario solo ve sus propios datos

---

## 🔧 Paso 2: Configurar Supabase Dashboard

### 2.1 Acceder al Dashboard

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto **Oxstore**

### 2.2 Configurar Template de Email

1. En el menú lateral: **Authentication** → **Email Templates**
2. Selecciona **"Confirm signup"**
3. Reemplaza el contenido con este template personalizado:

\`\`\`html
<h2>Bienvenido a Oxstore</h2>
<p>Hola,</p>
<p>Gracias por registrarte en Oxstore. Para activar tu cuenta, confirma tu email haciendo clic en el siguiente enlace:</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Confirmar mi email</a></p>
<p>Si no creaste esta cuenta, puedes ignorar este email.</p>
<p>Saludos,<br><strong>El equipo de Oxstore</strong></p>
\`\`\`

4. Haz clic en **"Save"**

### 2.3 Configurar URLs de Redirección

1. Ve a **Authentication** → **URL Configuration**

2. **Site URL:** Ingresa tu URL principal
   \`\`\`
   https://tu-dominio.vercel.app
   \`\`\`

3. **Redirect URLs:** Agrega estas URLs (una por línea):
   \`\`\`
   https://tu-dominio.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   https://*.vercel.app/auth/callback
   \`\`\`

4. Haz clic en **"Save"**

---

## 📧 Paso 3: Configurar Email desde noreply@oxstoreuy.com

### Opción A: Gmail SMTP (Recomendado)

**Requisitos:**
- Cuenta de Gmail (idealmente con tu dominio si tienes Google Workspace)
- Verificación en dos pasos activada

**Pasos:**

1. **Generar Contraseña de Aplicación:**
   - Ve a tu cuenta de Google → **Seguridad**
   - Busca **"Contraseñas de aplicaciones"**
   - Selecciona **"Correo"** y **"Otro dispositivo"**
   - Copia la contraseña de 16 caracteres

2. **Configurar en Supabase:**
   - Dashboard de Supabase → **Project Settings** → **Auth**
   - Scroll hasta **"SMTP Settings"**
   - Activa **"Enable Custom SMTP"**
   - Completa:
     \`\`\`
     Host: smtp.gmail.com
     Port: 587
     Username: tu-email@gmail.com
     Password: [contraseña de aplicación de 16 caracteres]
     Sender email: noreply@oxstoreuy.com
     Sender name: Oxstore
     \`\`\`
   - Haz clic en **"Save"**

### Opción B: Email de Supabase (Para Pruebas Rápidas)

Si no configuras SMTP:
- ✅ Los emails se envían desde `noreply@supabase.io`
- ✅ Funciona perfectamente para desarrollo
- ✅ Puedes configurar tu SMTP más adelante

---

## 🧪 Paso 4: Probar el Sistema

### 4.1 Registrar un Usuario

1. Ve a `/auth/registro` en tu aplicación
2. Completa el formulario:
   - **Email:** usa tu email personal
   - **Contraseña:** mínimo 6 caracteres
   - **Nombre y Apellido:** tus datos
3. Haz clic en **"Crear cuenta"**
4. Verás: "¡Cuenta creada! Revisa tu email para confirmar tu cuenta"

### 4.2 Confirmar Email

1. Abre tu bandeja de entrada (revisa spam si no lo ves)
2. Busca el email de Oxstore
3. Haz clic en **"Confirmar mi email"**
4. Serás redirigido automáticamente a la aplicación

### 4.3 Iniciar Sesión

1. Ve a `/auth/login`
2. Ingresa tu email y contraseña
3. Haz clic en **"Iniciar sesión"**
4. Serás redirigido a `/cuenta`

### 4.4 Completar Perfil

1. En `/cuenta`, verás tu nombre y apellido
2. Completa tu información:
   - Dirección
   - Ciudad
   - Código Postal
   - Teléfono
   - DNI
3. Haz clic en **"Guardar cambios"**
4. Recarga la página para verificar que se guardó

---

## ✅ Paso 5: Verificar en Supabase

### 5.1 Ver Usuarios Registrados

1. Dashboard → **Authentication** → **Users**
2. Deberías ver tu usuario con:
   - ✅ Email confirmado
   - ✅ Estado: Active

### 5.2 Ver Perfiles Creados

1. Dashboard → **Table Editor** → **user_profiles**
2. Deberías ver tu perfil con nombre y apellido

### 5.3 Revisar Logs

1. Dashboard → **Logs** → **Auth Logs**
2. Verifica que no haya errores
3. Deberías ver eventos de:
   - User signed up
   - Email confirmed
   - User logged in

---

## 🔧 Solución de Problemas

### ❌ El email no llega

**Soluciones:**
1. ✅ Revisa la carpeta de **spam**
2. ✅ Verifica la configuración SMTP en **Project Settings** → **Auth**
3. ✅ Revisa **Logs** → **Auth Logs** para ver errores de envío
4. ✅ Si usas Gmail, verifica que la contraseña de aplicación sea correcta
5. ✅ Intenta enviar un email de prueba desde Supabase

### ❌ Error: "Email not confirmed"

**Causa:** El usuario no ha confirmado su email

**Soluciones:**
1. Pide al usuario que revise su email y confirme
2. Para desarrollo temporal (NO para producción):
   - Ve a **Authentication** → **Providers** → **Email**
   - Desactiva **"Confirm email"**
   - **⚠️ IMPORTANTE:** Reactívalo antes de producción

### ❌ Error: "Invalid login credentials"

**Causas posibles:**
1. Email no confirmado
2. Contraseña incorrecta
3. Usuario no existe

**Soluciones:**
1. Verifica en **Authentication** → **Users** que el usuario existe
2. Verifica que el email esté confirmado (columna "Confirmed")
3. Intenta resetear la contraseña

### ❌ No se guarda el perfil

**Soluciones:**
1. Verifica que el script SQL se ejecutó correctamente
2. Revisa la consola del navegador (F12) para ver errores
3. Verifica en **Table Editor** → **user_profiles** que la tabla existe
4. Verifica que RLS esté habilitado y las políticas estén activas

---

## 📋 Variables de Entorno

**✅ Ya configuradas en tu proyecto:**
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

**No necesitas agregar ninguna variable adicional.**

---

## 📁 Archivos Creados

- ✅ `lib/supabase/client.ts` - Cliente Supabase para navegador
- ✅ `lib/supabase/server.ts` - Cliente Supabase para servidor  
- ✅ `lib/supabase/middleware.ts` - Utilidades para middleware
- ✅ `middleware.ts` - Middleware para refrescar tokens
- ✅ `app/auth/login/page.tsx` - Página de login
- ✅ `app/auth/registro/page.tsx` - Página de registro
- ✅ `app/auth/registro-exitoso/page.tsx` - Confirmación
- ✅ `app/auth/error/page.tsx` - Página de error
- ✅ `scripts/45-setup-user-authentication.sql` - Script SQL
- ✅ `GUIA_AUTENTICACION.md` - Esta guía

---

## 🚀 Próximos Pasos

Una vez que todo funcione:

1. **Carrito por usuario** - Los items del carrito se guardan por usuario autenticado
2. **Checkout protegido** - Solo usuarios autenticados pueden comprar
3. **Datos autocompletados** - El checkout usa los datos del perfil
4. **Historial de órdenes** - Los usuarios pueden ver sus compras anteriores

---

## 💡 Consejos de Seguridad

1. ✅ **Nunca desactives RLS** en producción
2. ✅ **Siempre requiere confirmación de email** en producción
3. ✅ **Usa contraseñas fuertes** (mínimo 8 caracteres)
4. ✅ **Revisa los logs regularmente** para detectar actividad sospechosa
5. ✅ **Configura rate limiting** en Supabase para prevenir ataques

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:
1. Revisa los logs en la consola del navegador (F12)
2. Revisa los logs de Supabase en **Logs** → **Auth Logs**
3. Verifica que el script SQL se ejecutó sin errores
4. Asegúrate de que las URLs de redirección estén correctas

**¡Tu sistema de autenticación está listo para usar! 🎉**

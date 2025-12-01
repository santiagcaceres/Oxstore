# Guía para Eliminar Usuarios

## Método 1: Desde el Panel de Administración (RECOMENDADO)

### Eliminar todos los usuarios clientes:

1. Inicia sesión en el admin: `/login`
   - Email: `admin@oxstore.com`
   - Contraseña: `admin123`

2. Ve a **Usuarios** en el menú lateral

3. Verás una **tarjeta amarilla** en la parte superior que dice "Eliminar Todos los Usuarios Clientes"

4. Haz clic en el botón **"Eliminar X usuarios clientes"**

5. Confirma en el diálogo que aparece

6. El sistema eliminará todos los usuarios excepto administradores

### Eliminar un usuario individual:

1. Ve a **Usuarios** en el menú lateral

2. Busca el usuario que quieres eliminar usando la barra de búsqueda

3. Haz clic en el **ícono de basurero rojo** al final de la fila del usuario

4. Confirma la eliminación en el diálogo

5. El usuario será eliminado permanentemente

## Método 2: Usando Scripts SQL

Si prefieres usar SQL directamente:

1. Ve a la página de **Scripts** en el admin (si está disponible)

2. Ejecuta el script `53-manual-delete-all-users.sql`

3. O ve al Dashboard de Supabase:
   - Abre tu proyecto en Supabase
   - Ve a **SQL Editor**
   - Ejecuta:
   \`\`\`sql
   DELETE FROM user_profiles WHERE email NOT LIKE '%admin%';
   \`\`\`
   - Luego ve a **Authentication > Users** y elimina manualmente los usuarios

## Método 3: Desde Supabase Dashboard

1. Abre tu proyecto en Supabase Dashboard

2. Ve a **Authentication > Users**

3. Selecciona los usuarios que quieres eliminar

4. Haz clic en **Delete users**

5. Confirma la eliminación

## IMPORTANTE

- **Los usuarios administradores NO serán eliminados** con el método 1
- **Esta acción es PERMANENTE** y no se puede deshacer
- **Los pedidos de los usuarios se mantendrán** en el sistema
- **Siempre haz un respaldo** antes de eliminar datos masivamente

## Verificación de Email Duplicado en Registro

El sistema ya verifica automáticamente si un email existe antes de crear una cuenta:

- Si alguien intenta registrarse con un email que ya existe, verá un mensaje de error
- El mensaje dirá: "Este email ya está registrado. Por favor, inicia sesión o usa otro email."
- No se creará una cuenta duplicada

## Cambiar Contraseña de Usuario

Los usuarios pueden cambiar su contraseña desde su perfil:

1. Iniciar sesión en `/auth/login`
2. Ir a **Mi Cuenta** (`/cuenta`)
3. Buscar la sección **"Cambiar Contraseña"**
4. Ingresar la contraseña actual y la nueva contraseña
5. Hacer clic en **"Actualizar Contraseña"**

## Recuperar Contraseña

Si un usuario olvidó su contraseña:

1. Ir a `/auth/forgot-password`
2. Ingresar su email
3. Recibirá un email con un enlace para resetear su contraseña
4. Hacer clic en el enlace y crear una nueva contraseña

# Configuración de Supabase para Oxstore

## Problema: Emails Duplicados al Registrarse

### Causa
Supabase envía automáticamente un email de confirmación cuando un usuario se registra, además del email personalizado con la contraseña que envía la aplicación.

### Solución

1. **Acceder al Dashboard de Supabase**
   - URL: https://supabase.com/dashboard/project/lshvnpixfhltpyvbaqie

2. **Desactivar Confirmación de Email**
   - Ve a: **Authentication** → **Providers**
   - Busca la sección **Email**
   - Desactiva la opción: **"Confirm email"** o **"Enable email confirmations"**
   - Guarda los cambios

3. **Verificar Rate Limiting** (opcional, para permitir más registros)
   - Ve a: **Authentication** → **Rate Limits**
   - Ajusta los límites según necesites:
     - Por defecto: 4-5 intentos por hora por dirección IP
     - Recomendado: 10-20 intentos por hora para desarrollo

## Resultado Esperado

Después de estos cambios:
- Los usuarios recibirán **SOLO UN EMAIL** con su contraseña al registrarse
- Podrán **iniciar sesión INMEDIATAMENTE** sin necesidad de confirmar el email
- El sistema funcionará de forma fluida para el checkout

## Notas Importantes

- Esta configuración es ideal para una tienda ecommerce donde queremos que los usuarios compren rápidamente
- El email de bienvenida con la contraseña es más útil que el email de confirmación genérico de Supabase
- Los usuarios pueden cambiar su contraseña desde su perfil una vez que inicien sesión

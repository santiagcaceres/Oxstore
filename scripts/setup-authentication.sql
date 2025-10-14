-- Script único para configurar autenticación con verificación por código
-- Ejecutar este script una sola vez

-- Agregar campos de verificación a user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Crear índice para búsqueda rápida por código
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_code 
ON user_profiles(verification_code) 
WHERE verification_code IS NOT NULL;

-- Actualizar usuarios existentes como verificados
UPDATE user_profiles 
SET is_verified = TRUE, verified_at = NOW() 
WHERE is_verified IS NULL OR is_verified = FALSE;

COMMENT ON COLUMN user_profiles.verification_code IS 'Código de 6 dígitos para verificar email';
COMMENT ON COLUMN user_profiles.verification_code_expires_at IS 'Fecha de expiración del código (15 minutos)';
COMMENT ON COLUMN user_profiles.is_verified IS 'Si el usuario ha verificado su email';
COMMENT ON COLUMN user_profiles.verified_at IS 'Fecha en que se verificó el email';

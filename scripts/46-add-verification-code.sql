-- Agregar campos para código de verificación en user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Índice para búsqueda rápida por código
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_code 
ON user_profiles(verification_code) 
WHERE verification_code IS NOT NULL;

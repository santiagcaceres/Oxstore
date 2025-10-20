-- Remove verification system from database
-- This script removes all verification-related columns and tables

-- Remove verification columns from user_profiles
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS is_verified,
DROP COLUMN IF EXISTS verified_at,
DROP COLUMN IF EXISTS verification_code,
DROP COLUMN IF EXISTS verification_code_expires_at;

-- Drop verification_codes table if it exists
DROP TABLE IF EXISTS verification_codes;

-- Add comment to track changes
COMMENT ON TABLE user_profiles IS 'User profiles without email verification system - updated 2025-01-19';

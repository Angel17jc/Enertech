-- Add optional profile fields: avatar_url, phone, bio, timezone
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS timezone text;

-- Update comments
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL pública del avatar del usuario (almacenado en Storage)';
COMMENT ON COLUMN public.profiles.phone IS 'Número de teléfono del usuario (opcional)';
COMMENT ON COLUMN public.profiles.bio IS 'Biografía/nota corta del usuario';
COMMENT ON COLUMN public.profiles.timezone IS 'Zona horaria del usuario';

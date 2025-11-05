-- Agregar campos personales al perfil: fecha de nacimiento, género, altura, peso
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birthdate date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS height_cm integer,
  ADD COLUMN IF NOT EXISTS weight_kg numeric(6,2);

-- Agregar comentarios a las columnas
COMMENT ON COLUMN public.profiles.birthdate IS 'Fecha de nacimiento del usuario (YYYY-MM-DD)';
COMMENT ON COLUMN public.profiles.gender IS 'Género del usuario (masculino|femenino|otro|prefiero_no_decir)';
COMMENT ON COLUMN public.profiles.height_cm IS 'Altura en centímetros (cm)';
COMMENT ON COLUMN public.profiles.weight_kg IS 'Peso en kilogramos (kg) con 2 decimales';

-- Agregar restricciones para validar altura y peso
ALTER TABLE public.profiles 
ADD CONSTRAINT chk_profiles_height_positive 
  CHECK (height_cm IS NULL OR (height_cm > 0 AND height_cm < 300));

ALTER TABLE public.profiles 
ADD CONSTRAINT chk_profiles_weight_positive 
  CHECK (weight_kg IS NULL OR (weight_kg > 0 AND weight_kg < 1000));

-- Agregar restricción para validar valores del género
ALTER TABLE public.profiles
ADD CONSTRAINT chk_profiles_gender_values 
  CHECK (gender IS NULL OR gender IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir'));

-- Crear índice para búsquedas por fecha de nacimiento (opcional)
CREATE INDEX IF NOT EXISTS idx_profiles_birthdate ON public.profiles(birthdate);

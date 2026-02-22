-- Ruleta: colores rojo, azul y blanco (texto negro en segmentos blancos).
-- Ejecutar en Supabase → SQL Editor para el negocio omar-bien-abdaljalil.

UPDATE public.bars
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{wheel,ui,segment_colors}',
  '["#8B1E1E", "#1C2E4A", "#FDFCF9", "#8B1E1E", "#1C2E4A", "#FDFCF9"]'::jsonb
)
WHERE slug = 'omar-bien-abdaljalil';

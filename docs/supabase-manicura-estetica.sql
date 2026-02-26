-- ============================================================
-- Demo: Negocio de manicura y estética
-- Ejecutar en Supabase → SQL Editor (en este orden)
-- ============================================================

-- 1) Insertar el negocio
insert into public.bars (name, slug, stamp_goal, reward_title, reward_expires_days, stamp_daily_limit, wheel_enabled, config)
values (
  'Belleza Nails & Estética',
  'belleza-nails',
  8,
  'Manicura gratis',
  30,
  0,
  true,
  '{
    "version": 1,
    "theme": "esthetic",
    "business_type": "esthetic",
    "branding": {
      "name": "Belleza Nails & Estética",
      "logo_url": null,
      "theme": {
        "primary": "#D4A5A5",
        "secondary": "#C9B896",
        "text": "#ffffff"
      }
    },
    "seo": {
      "title": "Belleza Nails & Estética · Fidelización",
      "description": "Acumula sellos por cada visita y gana premios. Sin app, solo escanea el QR."
    },
    "features": {
      "wheel": true,
      "stamps": true,
      "wallet": true,
      "login": true,
      "admin": true
    },
    "stamps": {
      "goal": 8,
      "daily_limit": 0,
      "reward_title": "Manicura gratis"
    },
    "rewards": {
      "expires_days": 30
    },
    "wheel": {
      "enabled": true,
      "cooldown_days": 0,
      "ui": {
        "segment_colors": ["#F8D7DA", "#F5C6CB", "#E8D4E4", "#D4E8E0", "#FDE4E1", "#E8E0F0"]
      },
      "segments": [
        { "id": "stamp_1", "enabled": true, "label": "1 sello extra", "type": "stamp", "value": 1, "weight": 3 },
        { "id": "none_1", "enabled": true, "label": "Sigue jugando", "type": "none", "weight": 5 },
        { "id": "reward_1", "enabled": true, "label": "10% dto próxima visita", "type": "reward", "weight": 2 },
        { "id": "reward_2", "enabled": true, "label": "Esmaltado semi gratis", "type": "reward", "weight": 1 },
        { "id": "reward_3", "enabled": true, "label": "Tratamiento express gratis", "type": "reward", "weight": 1 }
      ]
    },
    "texts": {
      "common": {
        "loading": "Cargando...",
        "error_generic": "Ha ocurrido un error"
      },
      "landing": {
        "welcome_kicker": "Bienvenida a",
        "subtitle": "Acumula un sello por cada visita y canjea premios. Sin app, solo escanea el QR.",
        "cta_start": "Acceder",
        "cta_wallet": "Mi wallet",
        "cta_wheel": "Ruleta",
        "cta_premium": "Ver premios",
        "logout": "Cerrar sesión",
        "privacy_line_1": "Al continuar aceptas la política de privacidad del establecimiento.",
        "privacy_line_2": "Añade esta página a tu pantalla de inicio para acceder como app.",
        "error_not_found": "Negocio no encontrado"
      },
      "login": {
        "title_kicker": "Acceso",
        "subtitle": "Regístrate o entra para guardar tus sellos y premios.",
        "tab_signup": "Crear cuenta",
        "tab_login": "Entrar",
        "email_label": "Email",
        "email_placeholder": "tu@email.com",
        "password_label": "Contraseña",
        "password_placeholder": "********",
        "submit_signup": "Crear cuenta",
        "submit_login": "Entrar",
        "processing": "Procesando...",
        "hint_line_1": "Acceso con email y contraseña.",
        "hint_line_2": "Usa una contraseña de 8+ caracteres.",
        "validation_missing": "Rellena email y contraseña",
        "validation_password_len": "La contraseña debe tener al menos 6 caracteres"
      },
      "wallet": {
        "title_kicker": "Tu wallet",
        "section_stamps": "Tus sellos",
        "reward_for_completion": "Al completar:",
        "staff_actions_title": "Acciones (recepción / staff)",
        "staff_actions_subtitle": "Introduce el PIN del local para validar una visita o canjear un premio.",
        "pin_placeholder": "PIN",
        "pin_missing_add_stamp": "Introduce el PIN para añadir un sello",
        "pin_missing_redeem": "Introduce el PIN para canjear el premio",
        "add_stamp": "Añadir 1 sello",
        "processing": "Procesando...",
        "rewards_title": "Premios activos",
        "rewards_empty": "Aún no tienes premios activos.",
        "rewards_expires_at": "Caduca:",
        "rewards_ready": "Listo para usar",
        "redeem": "Canjear (staff)",
        "tip": "Guarda esta página en tu pantalla de inicio para abrirla como app.",
        "cta_wheel": "Ruleta",
        "stamps_completed_message": "¡Objetivo completado! Tienes un nuevo premio para canjear."
      },
      "wheel": {
        "title_kicker": "Ruleta",
        "cta_wallet": "Mi wallet",
        "cta_spin": "Girar ruleta",
        "spinning": "Girando...",
        "result_title": "Resultado",
        "saved_ok": "Premio guardado en tu wallet.",
        "saved_fail": "No se pudo guardar el premio.",
        "cta_view_reward": "Ver en wallet",
        "need_login": "Inicia sesión para girar"
      },
      "api": {
        "bar_not_found": "Negocio no encontrado",
        "wheel_disabled": "Ruleta no disponible",
        "invalid_pin": "PIN incorrecto",
        "daily_limit_reached": "Límite diario alcanzado",
        "reward_not_found": "Premio no encontrado",
        "reward_not_active": "Premio no disponible",
        "reward_wrong_user": "Este premio no te corresponde",
        "cooldown_active": "Vuelve a intentar más tarde"
      }
    }
  }'::jsonb
)
on conflict (slug) do update set
  name = excluded.name,
  stamp_goal = excluded.stamp_goal,
  reward_title = excluded.reward_title,
  config = excluded.config,
  updated_at = now();

-- 2) Añadir usuario staff con PIN 1234 (para demo)
insert into public.staff_users (bar_id, pin_hash, role)
select
  (select id from public.bars where slug = 'belleza-nails'),
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  'admin'
where not exists (
  select 1
  from public.staff_users su
  join public.bars b on b.id = su.bar_id
  where b.slug = 'belleza-nails'
    and su.pin_hash = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
);

-- ============================================================
-- URL de la demo: https://tu-dominio.com/b/belleza-nails
-- PIN staff para añadir sellos / canjear: 1234
-- ============================================================

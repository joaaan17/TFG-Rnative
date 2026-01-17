# Información general (estructura vigente)

Esta guía resume la estructura actual del proyecto (Expo + Expo Router) y el rol de cada carpeta/archivo principal.

---

## Estructura actual

```
app/                       # Solo rutas (Expo Router)
├─ _layout.tsx             # Layout raíz (Stack). Limpia clase "dark" en web.
├─ index.tsx               # Ruta inicial → delega en features/auth/LoginScreen
└─ modal.tsx               # Ejemplo de ruta modal

features/                  # Capa de dominio (MVVM por feature)
└─ auth/
   ├─ LoginScreen.tsx      # View: UI del login
   ├─ useAuthViewModel.ts  # ViewModel: estado/handlers
   ├─ auth.service.ts      # Service/Model: login simulado + estado inicial
   ├─ auth.types.ts        # Tipos de estado/credenciales
   └─ index.ts             # Barrel export

shared/                    # Reutilizable entre features
├─ components/
│  ├─ themed-text.tsx      # Texto tematizado (tokens DS)
│  ├─ themed-view.tsx      # View con fondo del DS
│  └─ ui/                  # Base UI (shadcn-like)
│     ├─ button.tsx        # Botón con variantes y colores del DS
│     ├─ card.tsx          # Contenedor con borde/fondo del DS
│     ├─ input.tsx         # Input con palette DS
│     ├─ label.tsx         # Label accesible
│     ├─ link.tsx          # Link de texto
│     ├─ separator.tsx     # Separador H/V
│     ├─ sign-form.tsx     # Formulario de login completo
│     ├─ social-connections.tsx # Botones OAuth (Apple/Google/Github)
│     └─ text.tsx          # Variantes tipográficas (h1..muted/link)
├─ hooks/
│  ├─ use-color-scheme.ts      # Fuerza modo claro (mobile)
│  ├─ use-color-scheme.web.ts  # Fuerza modo claro (web)
│  ├─ use-palette.ts           # Palette derivada de Colors
│  └─ use-theme-color.ts       # Selector de token de color
├─ models/                 # (vacío, reservado)
└─ services/               # (vacío, reservado)

design-system/             # Tokens globales
├─ colors.ts               # Paletas light/dark (text, background, primary, etc.)
├─ spacing.ts              # Escala de espaciado
├─ typography.ts           # Sizes/weights/fuentes por plataforma/web
└─ theme.ts                # Re-export centralizado de tokens

config/                    # Configuración
├─ env.ts                  # Env (EXPO_PUBLIC_API_URL, NODE_ENV, __DEV__)
└─ routes.ts               # Mapa nominal de rutas

constants/
└─ app.ts                  # Nombre/versión de la app

lib/
└─ utils.ts                # cn (tailwind merge/clsx)
```

## Alias y paths
- `@/*` apunta a la raíz.
- Alias específicos: `@shared/*`, `@features/*`, `@design-system/*`, `@config/*`, `@constants/*`, `@lib/*`.
- `components.json` (shadcn): `components`, `ui`, `hooks`, `utils` → `shared` / `lib`.

## Rol de los principales
- `app/_layout.tsx`: Stack root; usa `useColorScheme` forzado a light; quita `dark` en web; registra stack (index, modal).
- `app/index.tsx`: Ruta inicial; exporta `LoginScreen` desde `features/auth`.
- `features/auth/*`: Login completo (View + ViewModel + service + tipos + barrel).
- `shared/components/ui/*`: Base UI reusables con tokens del design system.
- `shared/hooks/*`: Color scheme forzado + palette + helper de colores.
- `design-system/*`: Tokens de color, spacing, tipografía; re-export en `theme.ts`.
- `config/env.ts`: Vars de entorno (EXPO_PUBLIC_API_URL, NODE_ENV, __DEV__).
- `config/routes.ts`: Mapa de rutas nominal.
- `constants/app.ts`: APP_NAME, APP_VERSION.
- `lib/utils.ts`: `cn` para combinar clases/tailwind.

## MVVM por feature (ligero)
- `*Screen.tsx` (View): UI/render; consume el ViewModel.
- `use*ViewModel.ts` (ViewModel): estado, efectos, handlers; llama a services.
- `*.service.ts` (Model/data): datos (API/storage/mock) y estado inicial.
- `*.types.ts`: contratos/DTOs.
- `index.ts`: barrel export.

## Reglas prácticas
- Rutas delgadas en `app/`: solo importan y exportan pantallas desde `features/`.
- Reutilizable en `shared/` cuando se usa en 2+ features.
- Tokens globales en `design-system/` (nunca hardcodear colores/espaciados).
- Config en `config/`; constantes en `constants/`; utilidades globales en `lib/`.
- Si cambias estructura de rutas, borra `.expo/` y arranca con caché limpio (`npm start -- --clear`).

Última actualización: Enero 2026

## TFG React Native (Expo) — Plantilla real del proyecto

Este repositorio es una **plantilla completa** de app móvil con:

- **Expo (SDK 54)** + **Expo Router**
- **NativeWind v4** (Tailwind para React Native)
- **UI tipo shadcn** (componentes en `shared/components/ui/` + `components.json`)
- **Arquitectura por features (MVVM ligero)** en `features/`
- **Design System** en `design-system/` (tokens: colors/spacing/typography)
- **SVG como componentes** con `react-native-svg` + `react-native-svg-transformer`

La idea de este README es que **Cursor** (y cualquier dev) pueda:

- arrancar este proyecto
- y/o **crear uno nuevo desde cero** con **exactamente la misma organización y setup**
- reutilizando componentes “de la librería de la propia app” (`shared/components/*`)

---

## Requisitos

- **Node.js** (LTS recomendado)
- **npm** (incluido con Node)
- **Expo Go** (para probar en móvil) o Android Studio/Xcode
- En Windows, usa **PowerShell** (los comandos de este README están pensados para PowerShell)

---

## Arrancar ESTE proyecto

Desde la carpeta `TFG-Rnative/`:

```bash
npm install
npm run start
```

Atajos:

```bash
npm run android
npm run ios
npm run web
```

Limpiar caché (Metro):

```bash
npx expo start -c
```

---

## Estructura (la real del repo)

```txt
app/                          # RUTAS (Expo Router): archivos delgados, sin lógica
  _layout.tsx                 # Stack + ThemeProvider + fonts
  index.tsx                   # /  -> delega a features/auth
  main.tsx                    # /main -> delega a features/Inicio
  ia-preguntas.tsx            # /ia-preguntas -> delega a features/IApreguntas
  profile.tsx                 # /profile -> delega a features/profile
  investments.tsx             # /investments -> delega a features/investments
  dashboard.tsx                # /dashboard -> delega a features/dashboard
  modal.tsx                   # ruta modal (si aplica)

features/                     # FEATURES (MVVM ligero)
  auth/
    LoginScreen.tsx
    Login.styles.ts
    useAuthViewModel.ts
    auth.service.ts
    auth.types.ts
    components/
      sign-form.tsx
      social-connections.tsx
  Inicio/
    MainScreen.tsx
    Main.styles.ts
    components/
      NewsCard.tsx
      NewsCard.styles.ts
    news.types.ts
  IApreguntas/
    IApreguntas.tsx
    IApreguntas.styles.ts
    useIApreguntasViewModel.ts
    iaPreguntas.messages.ts
    components/
      ConsultorioComposer.tsx
      ConsultorioComposer.styles.ts
  profile/
    profile.tsx
    profileStyles.ts
    components/
      profileAvatar.tsx
  investments/
    investments.tsx
    investmentsStyles.ts
  dashboard/
   dashboard.tsx

shared/                       # “Librería” interna reutilizable
  components/
    layout/
      AppShell.tsx            # Layout global + menubar inferior (overlay)
      AppShell.styles.ts
    ui/                       # Componentes tipo shadcn (Button, Card, Text, Input, etc.)
    app-menubar.tsx           # Menú inferior (iconos)
    card-modal.tsx            # Modal tipo “sheet” (sube desde abajo)
    TypewriterTextProps.tsx   # Texto con animación “typewriter”
    price-chart.tsx           # Gráfico SVG (rangos 3D..All)
    asset-label.tsx           # “fila/label” de activo (Bitcoin/XRP)
  hooks/
    use-color-scheme.ts
    use-palette.ts
    use-theme-color.ts
  icons/                      # SVGs
  fonts/                      # ArchivoBlack-Regular.ttf

design-system/                # Tokens globales
  colors.ts
  spacing.ts
  typography.ts
  theme.ts                    # re-export de tokens

lib/
  utils.ts                    # cn() + tailwind-merge

types/
  svg.d.ts                    # typing para importar .svg

global.css                    # NativeWind v4 + variables CSS (web)
tailwind.config.js
metro.config.js
babel.config.js
tsconfig.json
components.json               # shadcn config (aliases hacia shared/)
```

---

## Principios del proyecto (para mantenerlo “igual”)

### Rutas (Expo Router) = delgadas

- Todo lo de `app/` **solo delega** a una pantalla feature.
- Nada de lógica de negocio en rutas.

Ejemplo típico:

```tsx
import MainScreen from '@/features/Inicio/MainScreen';
export default MainScreen;
```

### Features = MVVM ligero

En cada feature:

- **View**: `*Screen.tsx` (UI + render)
- **ViewModel**: `use*ViewModel.ts` (estado, handlers, orquestación)
- **Model/Service**: `*.service.ts` (API/storage/transforms)
- **Types**: `*.types.ts`
- **components/**: piezas específicas de esa feature

### Shared = “librería interna”

Todo lo reutilizable vive aquí:

- UI (`shared/components/ui/*`)
- Layout global (`AppShell`)
- Modales reutilizables (`CardModal`)
- Componentes transversales (Typewriter, charts, etc.)

Si un componente se usa en 2+ features, debe vivir en `shared/`.

---

## Cómo reutilizar componentes “de esta app” (tu librería interna)

### Importar con aliases (recomendado)

Este repo usa `@/*` apuntando a la raíz. Ejemplos:

- `@/shared/components/ui/button`
- `@/shared/components/card-modal`
- `@/features/Inicio/MainScreen`
- `@/design-system/colors`

Los aliases están en:

- `tsconfig.json` (`compilerOptions.paths`)
- `babel.config.js` (`module-resolver`)

### Patrón recomendado para UI

- Si es UI base (Button/Card/Text/Input…): `shared/components/ui/`
- Si es un componente “de app” (menú, modal, chart…): `shared/components/`
- Si es de una sola feature: `features/<feature>/components/`

---

## Setup técnico (lo que hace que todo “cuadre”)

### Expo Router

- `package.json`:
  - `"main": "expo-router/entry"`
- `app/_layout.tsx`:
  - define el Stack y registra rutas (`main`, `profile`, etc.)

Instalación típica en un proyecto nuevo:

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens
```

### NativeWind v4 (Tailwind)

Dependencias:

```bash
npm install nativewind tailwindcss tailwind-merge clsx class-variance-authority tailwindcss-animate
```

Archivos clave (en este repo ya están):

- `global.css` (con `@tailwind base; @tailwind components; @tailwind utilities;`)
- `tailwind.config.js` (content paths a `app/`, `features/`, `shared/`, etc.)
- `babel.config.js`:
  - preset expo con `jsxImportSource: 'nativewind'`
  - plugin `nativewind/babel`
- `tsconfig.json`:
  - `types: ["nativewind/types", "node"]`
- `metro.config.js`:
  - `withNativeWind(config, { input: './global.css' })`

### SVG como componentes

Dependencias:

```bash
npm install react-native-svg
npm install -D react-native-svg-transformer
```

Config:

- `metro.config.js` (transformer + resolver para `.svg`)
- `types/svg.d.ts` para TypeScript

Uso:

```tsx
import ProfileIcon from '@/shared/icons/profile.svg';
<ProfileIcon width={24} height={24} fill="#000" />;
```

### Animaciones / Gestos

Este repo ya trae:

- `react-native-reanimated`
- `react-native-gesture-handler`

Y el plugin en `babel.config.js`:

- `'react-native-reanimated/plugin'`

---

## Crear un proyecto NUEVO “idéntico” a este (paso a paso)

### 1) Crear app Expo

```bash
npx create-expo-app@latest MiApp
cd MiApp
```

### 2) Instalar dependencias (copiar el set de este repo)

Recomendación: copia `package.json` de este repo como referencia. Si no, instala lo esencial:

```bash
# Router
npx expo install expo-router react-native-safe-area-context react-native-screens

# NativeWind + utilidades “shadcn style”
npm install nativewind tailwindcss clsx tailwind-merge class-variance-authority tailwindcss-animate

# SVG
npm install react-native-svg
npm install -D react-native-svg-transformer

# UI / Icons / Helpers (las que usamos aquí)
npm install lucide-react-native

# Primitives RN (los que aparecen en este repo)
npm install @rn-primitives/slot @rn-primitives/menubar @rn-primitives/label @rn-primitives/separator @rn-primitives/portal
npm install @radix-ui/react-primitive
```

### 3) Copiar la estructura de carpetas

Crea (o copia directamente) estas carpetas:

- `app/` (solo rutas delgadas)
- `features/`
- `shared/`
- `design-system/`
- `lib/`
- `types/`

### 4) Copiar configs tal cual (muy importante)

Copiar/crear estos archivos (de este repo):

- `babel.config.js`
- `metro.config.js`
- `tailwind.config.js`
- `tsconfig.json`
- `global.css`
- `nativewind-env.d.ts`
- `types/svg.d.ts`

### 5) Activar Expo Router

En `package.json`:

- `"main": "expo-router/entry"`

Y crea `app/_layout.tsx` con tu `Stack` y pantallas.

### 6) Arrancar

```bash
npm install
npx expo start -c
```

---

## Añadir componentes tipo “shadcn” (como en este repo)

Este repo mantiene sus componentes base en:

- `shared/components/ui/`

Y el config en:

- `components.json` (aliases apuntando a `@/shared/components/ui`)

Si quieres “copiar” componentes de esta app a otra:

- copia `shared/components/ui/`
- copia `lib/utils.ts` (para `cn`)
- copia `components.json`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`
- y asegúrate de tener las mismas dependencias en `package.json`

---

## Portfolio Analytics (equity curve)

En la pantalla **Inversiones**, el gráfico principal muestra la **curva de valor total de la cartera** (equity curve) calculada con holdings + efectivo + históricos de precios (caché global) + transacciones. También está “ventas”: la vista **Invertido** (dinero invertido).

### Endpoint (requiere autenticación `Authorization: Bearer <token>`)

| Método | Ruta | Query | Descripción |
|--------|------|-------|-------------|
| GET | `/api/investments/portfolio/performance` | `range=1D\|1W\|1M\|3M\|6M\|1Y` | Equity curve: puntos `{ t, equity, cash, positions, invested }` |

### Ejemplo curl (reemplaza `TOKEN` y base URL si aplica)

```bash
curl -s -H "Authorization: Bearer TOKEN" "http://localhost:3000/api/investments/portfolio/performance?range=1M"
```

Los históricos de precios se obtienen del **caché global** (PriceCacheService). Pruebas unitarias del cálculo (equity): `npm run test`.

---

## Scripts útiles

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
npm run format
npm run test          # pruebas unitarias (vitest)
npm run test:watch   # pruebas en modo watch
```

---

## Troubleshooting (lo típico)

- **Cache / cosas raras tras mover archivos**:

```bash
npx expo start -c
```

- **PowerShell no soporta `&&` igual que bash**:
  - ejecuta comandos en líneas separadas:

```bash
cd TFG-Rnative
npm install
```

- **SVG no renderiza**:
  - revisa `metro.config.js` + `react-native-svg-transformer`
  - revisa que el `.svg` tenga `viewBox`

---

## Nota para Cursor (cómo trabajar “igual” que este repo)

Cuando añadas cosas nuevas:

- **Rutas**: solo delegan (`app/*.tsx`)
- **Pantallas**: van en `features/<feature>/`
- **Reutilizable**: va en `shared/`
- **Tokens**: van en `design-system/` (evitar hardcodear colores/espaciados)
- **Imports**: usa `@/` siempre (consistencia y refactor más fácil)

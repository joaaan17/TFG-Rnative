# Stack tecnológico — TFG-Rnative

Resumen de tecnologías usadas en el proyecto (app móvil/web + API + datos).

---

## Frontend (cliente)

| Área | Tecnología | Uso |
|------|------------|-----|
| **Framework** | [Expo](https://expo.dev) ~54 | Desarrollo multiplataforma (iOS, Android, Web) |
| **Runtime UI** | [React](https://react.dev) 19 + [React Native](https://reactnative.dev) 0.81 | Componentes y render nativo |
| **Web** | [react-native-web](https://necolas.github.io/react-native-web/) | Misma base de código para navegador |
| **Navegación** | [Expo Router](https://docs.expo.dev/router/introduction/) ~6 | Rutas basadas en archivos (`app/`) |
| **Navegación (tabs)** | [@react-navigation/native](https://reactnavigation.org/) + bottom-tabs | Pestañas inferiores |
| **Estilos** | [NativeWind](https://www.nativewind.dev/) v4 + [Tailwind CSS](https://tailwindcss.com/) 3 | Utilidades tipo Tailwind en RN |
| **Componentes UI** | [@rn-primitives](https://www.rn-primitives.com/) (slot, label, menubar, separator) | Primitivos accesibles |
| **Iconos** | [lucide-react-native](https://lucide.dev/) | Iconografía vectorial |
| **Gráficos** | [lightweight-charts](https://www.tradingview.com/lightweight-charts/) (WebView en RN), [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit) | Cartera y mercados |
| **Imágenes** | [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) | Carga y cache de imágenes |
| **Fuentes** | @expo-google-fonts (DM Sans, Manrope, Plus Jakarta Sans) | Tipografía |
| **Almacenamiento local** | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) | Persistencia (cache de noticias, etc.) |
| **Sesión segura** | [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) | Tokens sensibles en nativo |
| **Animación** | [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) + worklets | Animaciones y gestos |

### Experiments (Expo)

- **Typed routes** (`experiments.typedRoutes`)
- **React Compiler** (`experiments.reactCompiler`)
- **New Architecture** habilitada en Android (`newArchEnabled`)

---

## Backend (API)

| Área | Tecnología | Uso |
|------|------------|-----|
| **Runtime** | [Node.js](https://nodejs.org/) | Servidor |
| **Framework HTTP** | [Express](https://expressjs.com/) 4 | Rutas REST, middleware, CORS |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) ~5.9 | Tipado en todo el proyecto |
| **Ejecución TS** | [tsx](https://github.com/privatenumber/tsx) | Arranque del servidor (`server/index.ts`) |
| **Autenticación** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (JWT) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Tokens y hash de contraseñas |
| **Email** | [nodemailer](https://nodemailer.com/) | Envío de correos (registro, recuperación, etc.) |

---

## Datos y persistencia

| Área | Tecnología | Uso |
|------|------------|-----|
| **Base de datos** | [MongoDB](https://www.mongodb.com/) | Almacenamiento principal |
| **ODM** | [Mongoose](https://mongoosejs.com/) 8 | Modelos y consultas |
| **Driver** | [mongodb](https://www.npmjs.com/package/mongodb) 7 | Conexión de bajo nivel si aplica |

---

## Integraciones externas (IA y datos de mercado)

| Servicio | Uso en el proyecto |
|----------|-------------------|
| **OpenAI API** (`openai` SDK) | Consultorio IA, noticias educativas (explicación y quiz), quiz scheduler |
| **NewsAPI** | Titulares de noticias (feature `iaNoticiasEducativas`) |
| **Yahoo Finance** (`yahoo-finance2`) | Cotizaciones y datos de mercado |

---

## Arquitectura del repositorio

- **Estructura por features**: `features/<dominio>/` con `front/` (UI) y `back/` (API, dominio) cuando aplica.
- **Código compartido**: `shared/` (componentes, hooks, constantes).
- **Entrada del servidor**: `server/index.ts` monta routers de cada feature.
- **App Expo**: carpeta `app/` (Expo Router) + `app.json` / `app.config`.

---

## Herramientas de desarrollo

| Herramienta | Uso |
|-------------|-----|
| [ESLint](https://eslint.org/) + `eslint-config-expo` | Linting |
| [Prettier](https://prettier.io/) | Formateo |
| [Vitest](https://vitest.dev/) | Tests unitarios |
| [Metro](https://metrobundler.dev/) (vía Expo) | Bundler React Native |
| [Babel](https://babeljs.io/) + `babel-plugin-module-resolver` | Alias de imports (`@/`) |

---

## Despliegue (referencia)

| Destino | Rol |
|---------|-----|
| **Vercel** | Build estático web (`expo export -p web` → `dist/`) |
| **Railway / Render** | API Node (Express) — ver `BACKEND_DEPLOY.md` |
| **MongoDB Atlas** (o similar) | Base de datos en la nube |

---

## Variables de entorno relevantes (resumen)

- **Cliente**: `EXPO_PUBLIC_API_URL` — URL base del backend.
- **Servidor**: `AUTH_DB_URI`, `AUTH_JWT_SECRET`, `OPENAI_API_KEY`, `NEWS_API_KEY`, y otras descritas en `START.md` y `BACKEND_DEPLOY.md`.

---

*Última revisión según `package.json` y configuración del proyecto.*

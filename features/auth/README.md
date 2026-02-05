## Auth (Login + Register) — Implementación completa (Backend + Frontend)

Este documento explica **todo lo que se ha implementado** en `features/auth/` y cómo encaja con el patrón que estáis usando:

- **Backend**: Node.js + Express + Mongoose, con separación tipo **Clean Architecture / Hexagonal** (dominio y casos de uso no dependen de Express/Mongo).
- **Frontend**: Expo (React Native) con **MVVM**, consumiendo el backend y persistiendo sesión (token) en almacenamiento seguro.

---

## Estructura de carpetas (estado actual)

### Backend — `features/auth/back/src/`

- **`domain/`** (contratos puros)
  - `auth.types.ts`: `User`, `AuthToken`, `NewUser`
  - `ports.ts`: `AuthRepository`, `PasswordService`, `TokenService`
- **`application/usecases/`** (reglas de negocio)
  - `login.ts`: `LoginUseCase`
  - `register.ts`: `RegisterUseCase`
- **`infrastructure/`** (adaptadores concretos)
  - `persistence/mongo/`
    - `user.model.ts`: Schema/Model Mongoose
    - `mongoRepository.ts`: `MongoAuthRepository` (mapea `_id` → `id`)
  - `crypto/bcryptHasher.ts`: `BcryptHasher` usando `bcryptjs`
  - `tokens/jwtTokerService.ts`: `JwtTokenService` usando `jsonwebtoken`
  - `persistence/index.ts`: `InMemoryAuthRepository` (útil en tests/demos)
- **`config/`** (wiring manual)
  - `auth.env.ts`: lectura de variables `AUTH_DB_URI`, `AUTH_JWT_SECRET`, etc.
  - `auth.wiring.ts`: instancia repositorio/servicios + exporta `loginUseCase` y `registerUseCase`
- **`api/`** (entrada HTTP con Express)
  - `api.routes.ts`: `express.Router()` con `POST /login` y `POST /register`
  - `auth.controller.ts`: `loginController` + `registerController` (solo llaman a los casos de uso)
- **`index.ts`**: servidor Express + CORS + JSON + conexión Mongoose + montaje de rutas `/api/auth`

### Frontend — `features/auth/front/src/`

- **`types/auth.types.ts`**
  - `LoginBody` `{ email, password }`
  - `LoginResponse` `{ token, user }`
  - `AuthUser` `{ id, email, name }`
- **`api/authClient.ts`**
  - `login(credentials)` usando `fetch`
  - **Base URL dinámica**:
    - Android emulator → `http://10.0.2.2:3000`
    - iOS simulator/web → `http://localhost:3000`
    - físico → IP LAN (se deja comentado para ajustar)
- **`state/AuthContext.tsx`**
  - Context global con `signIn`, `signOut`, `useAuthSession()`
  - Persistencia:
    - `expo-secure-store` si está disponible
    - fallback a `@react-native-async-storage/async-storage`
- **`state/useAuthViewModel.ts`** (MVVM)
  - Estado: `email`, `password`, `isLoading`, `error`
  - `handleLogin()`:
    - valida inputs
    - llama `authClient.login`
    - si ok → `signIn(token, user)`
    - si error → `error`
- **`components/sign-form.tsx`**
  - Mantiene el **diseño original** (Card + inputs + social)
  - Ahora acepta props para conectarse al ViewModel:
    - `email`, `password`, `onEmailChange`, `onPasswordChange`, `isLoading`, `error`, `onSubmit`
- **`ui/LoginScreen.tsx`**
  - Renderiza `SignInForm` dentro de `ThemedView` con `Login.styles.ts`
  - Navega a `'/main'` cuando existe `session` (AuthContext)
- **Provider global**
  - `app/_layout.tsx` envuelve la app con `<AuthProvider />`

---

## Backend: qué se cambió y por qué (detalle)

### 1) Separación Clean / Hexagonal

La lógica de negocio vive en `application/usecases/*` y **solo habla con interfaces** de `domain/ports.ts`.

- **No hay imports de Express** en `application/` ni en `domain/`.
- **No hay imports de Mongo/Mongoose** en `application/` ni en `domain/`.

### 2) Solución escalable al problema del `id` en Mongo (registro)

Se detectó un problema típico:

- En Mongo, el identificador real es `_id` (ObjectId) y lo genera la base de datos.
- Antes, el registro intentaba generar un `id` manual (`randomUUID`) y el repositorio Mongo intentaba usarlo como `_id`, lo cual no es robusto.

Solución aplicada (patrón escalable):

- Se añadió `NewUser` (sin `id`) en `domain/auth.types.ts`.
- El puerto se ajustó:
  - `AuthRepository.save(user: NewUser): Promise<User>`
- El adaptador Mongo:
  - hace `UserModel.create(...)`
  - devuelve un `User` del dominio con `id = created._id.toString()`
  - cumple la regla: **mapper `_id` → `id`**

Esto hace el módulo portable: en SQL también sería natural que `save(NewUser)` devuelva `User` con `id` persistido.

### 3) Email de verificación (Nodemailer) sin romper Hexagonal

El envío de email se implementa como **puerto de salida**:

- **Puerto (Domain)**: `back/src/domain/ports.ts` define `MailService`.
- **Caso de uso (Application)**: `RegisterUseCase` recibe `MailService` por constructor y solo llama `sendVerificationCode(...)`.
- **Adaptadores (Infrastructure)**:
  - `back/src/infrastructure/mail/nodemailerService.ts`: implementación real con Nodemailer + SMTP.
  - `back/src/infrastructure/mail/consoleMailService.ts`: implementación “dummy” para desarrollo (imprime en consola).
- **Wiring (Config)**: `back/src/config/auth.wiring.ts` decide qué adaptador usar según env (`MAIL_MODE`).

Además, para que el flujo sea consistente, el registro persiste `verificationCode` e `isVerified`:

- `back/src/domain/auth.types.ts`: `User/NewUser` incluyen `isVerified` y `verificationCode`.
- `back/src/infrastructure/persistence/mongo/user.model.ts`: schema con `isVerified` (default `false`) y `verificationCode` (default `null`).

#### Variables de entorno (Mail)

Modo simple (recomendado para dev):

```env
MAIL_MODE=console
```

Modo SMTP (Nodemailer):

```env
MAIL_MODE=smtp
MAIL_HOST=smtp.tu-proveedor.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu_usuario
MAIL_PASS=tu_password
MAIL_FROM="Tu App <no-reply@tuapp.com>"
```

### 3) Controladores alineados con Express

En `api/auth.controller.ts`:

- Se tipó `req.body` correctamente usando `Request<..., ..., BodyType>` de Express.
- Se importó `registerUseCase` desde el wiring.
- Se evitó el error de TS donde `Request/Response` apuntaba a tipos del DOM (y `req.body` era `ReadableStream`).

### 4) Rutas y servidor

En `back/src/index.ts`:

- `app.use(cors())`
- `app.use(express.json())`
- `app.use('/api/auth', authRoutes)`
- `mongoose.connect(authEnv.dbUri)`

Endpoints:

- `POST /api/auth/login`
- `POST /api/auth/register`

---

## Frontend: qué se cambió y por qué (detalle)

### 1) Tipos alineados con el backend

Se definió:

- `LoginBody` para el request
- `LoginResponse` para la respuesta real (`token` + `user`)

### 2) Cliente HTTP robusto

En `authClient.ts`:

- Base URL dinámica para que funcione en emulador Android (`10.0.2.2`) y simulador iOS (`localhost`).
- Si el backend devuelve error, se lanza `Error(message)` con el `message` del backend.

### 3) Sesión persistente (AuthContext)

Se implementó un contexto global con:

- Restauración al iniciar la app (`readSession()`)
- Guardado/borrado en SecureStore o AsyncStorage (`writeSession()`)

### 4) MVVM (ViewModel) conectado

`useAuthViewModel.ts`:

- maneja loading/error
- llama al backend
- persiste sesión vía `signIn()`

### 5) UI con el diseño anterior

Se mantuvo el look original con `SignInForm` y `Login.styles.ts`, pero ahora el formulario se conecta a la lógica real.

---

## Cómo arrancar y probar

### 1) Variables de entorno (backend)

Crear `.env` en `TFG-Rnative/`:

```env
AUTH_DB_URI=mongodb://127.0.0.1:27017/tu_db
AUTH_JWT_SECRET=tu_secreto_largo
PORT=3000
```

### 2) Arrancar backend

Desde `TFG-Rnative`:

```bash
npx tsx features/auth/back/src/index.ts
```

### 3) Probar endpoints

- Register:
  - `POST http://localhost:3000/api/auth/register`
  - body: `{ "email": "...", "password": "...", "name": "..." }`
- Login:
  - `POST http://localhost:3000/api/auth/login`
  - body: `{ "email": "...", "password": "..." }`

### 4) Arrancar frontend

```bash
npm run start
```

> Si pruebas en **dispositivo físico**, cambia el base URL en `front/src/api/authClient.ts` por tu IP LAN.

---

## Notas de portabilidad (“copiar carpeta”)

Para llevar esto a otro proyecto:

- Lo más estable/portable:
  - `back/src/domain/**`
  - `back/src/application/**`
- Lo que suele cambiar:
  - `back/src/infrastructure/persistence/**` (BD)
  - `front/src/api/authClient.ts` (URL / configuración)
  - `front/src/state/AuthContext.tsx` (si el proyecto usa otro sistema de sesión)

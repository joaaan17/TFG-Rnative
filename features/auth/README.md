# Módulo Auth — Documentación completa

Este documento describe **en detalle** cómo funciona el módulo de autenticación en `features/auth/`, incluyendo Login, Registro, Verificación de email y Recuperación de contraseña.

---

## Índice

1. [Arquitectura general](#arquitectura-general)
2. [Backend — Estructura y flujos](#backend--estructura-y-flujos)
3. [Frontend — Estructura y flujos](#frontend--estructura-y-flujos)
4. [Flujos de usuario](#flujos-de-usuario)
5. [Configuración y arranque](#configuración-y-arranque)
6. [Portabilidad del módulo](#portabilidad-del-módulo)

---

## Arquitectura general

El módulo sigue dos patrones:

- **Backend**: Clean Architecture / Hexagonal — el dominio y los casos de uso no dependen de Express, Mongo ni Nodemailer.
- **Frontend**: MVVM — separación entre Vista (UI), ViewModel (lógica) y Model (tipos + API).

```
features/auth/
├── back/src/          # Backend Node.js + Express + Mongoose
│   ├── domain/        # Contratos puros (tipos, interfaces)
│   ├── application/   # Casos de uso (reglas de negocio)
│   ├── infrastructure/# Adaptadores (Mongo, Bcrypt, JWT, Nodemailer)
│   ├── config/        # Wiring (inyección de dependencias)
│   └── api/           # Controladores y rutas Express
└── front/src/         # Frontend Expo (React Native)
    ├── types/         # Tipos TypeScript
    ├── api/           # Cliente HTTP (authClient)
    ├── state/         # AuthContext + ViewModels
    ├── components/    # Formularios, modales
    └── ui/            # Pantallas (Login, Register)
```

---

## Backend — Estructura y flujos

### 1. Dominio (`back/src/domain/`)

**`auth.types.ts`** — Entidades del dominio:

- **`User`**: Usuario persistido con `id`, `email`, `passwordHash`, `name`, `isVerified`, `verificationCode`.
- **`NewUser`**: Usuario antes de persistir (sin `id`); Mongo genera el `_id`.
- **`AuthToken`**: Token JWT y tiempo de expiración.

**`ports.ts`** — Contratos (interfaces) que el dominio espera:

| Puerto | Métodos principales | Uso |
|--------|---------------------|-----|
| `AuthRepository` | `findByEmail`, `save`, `verifyCode`, `verifyCodeOnly`, `updateVerificationCode`, `updatePassword` | Persistencia de usuarios |
| `PasswordService` | `hash`, `compare` | Bcrypt para contraseñas |
| `TokenService` | `sign`, `verify` | JWT para sesiones |
| `MailService` | `sendVerificationCode` | Envío de emails |

### 2. Casos de uso (`back/src/application/usecases/`)

| Caso de uso | Archivo | Responsabilidad |
|-------------|---------|-----------------|
| **Login** | `login.ts` | Buscar usuario, comparar contraseña, generar JWT. No valida `isVerified`. |
| **Register** | `register.ts` | Comprobar email no existente, generar código 6 dígitos, hashear contraseña, guardar con `isVerified: false`, enviar email. |
| **Verify** | `verify.ts` | Validar código, marcar `isVerified: true`, limpiar `verificationCode`, devolver JWT. |
| **ResendCode** | `resend-code.ts` | Solo si `!isVerified`. Generar nuevo código, actualizar en BD, enviar email. |
| **SendPasswordResetCode** | `send-password-reset-code.ts` | Buscar usuario, generar código, actualizar en BD, enviar email. No comprueba `isVerified`. |
| **VerifyPasswordResetCode** | `verify-password-reset-code.ts` | Comprobar código con `verifyCodeOnly` (sin modificar `isVerified` ni el código). |
| **ResetPassword** | `reset-password.ts` | Validar código, hashear nueva contraseña, actualizar en BD, limpiar `verificationCode`. |

**Diferencia importante** entre verificación de registro y recuperación de contraseña:

- **Registro**: `verifyCode` marca al usuario como verificado y limpia el código.
- **Recuperación**: `verifyCodeOnly` solo valida; `ResetPasswordUseCase` actualiza la contraseña y limpia el código.

### 3. Infraestructura (`back/src/infrastructure/`)

| Adaptador | Archivo | Implementación |
|-----------|---------|----------------|
| Persistencia | `mongo/mongoRepository.ts` | Mongoose. Mapea `_id` → `id` al devolver `User`. |
| Modelo | `mongo/user.model.ts` | Schema con `email`, `passwordHash`, `name`, `isVerified`, `verificationCode`. |
| Contraseñas | `crypto/bcryptHasher.ts` | `bcryptjs` para hash y compare. |
| Tokens | `tokens/jwtTokerService.ts` | `jsonwebtoken` para sign y verify. |
| Email (producción) | `mail/nodemailerService.ts` | Nodemailer + SMTP. |
| Email (desarrollo) | `mail/consoleMailService.ts` | Solo `console.log`, sin envío real. |

### 4. Configuración (`back/src/config/`)

**`auth.env.ts`** — Variables obligatorias:

- `AUTH_DB_URI`: URI de MongoDB.
- `AUTH_JWT_SECRET`: Secreto para firmar JWTs.

**`mail.env.ts`** — Email:

- `MAIL_MODE` o `SMTP_MODE`: `console` o `smtp`.
- Si `smtp`: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` (o prefijo `SMTP_`).

**`auth.wiring.ts`** — Composición:

- Instancia `MongoAuthRepository`, `BcryptHasher`, `JwtTokenService`.
- Selecciona `NodemailerService` o `ConsoleMailService` según `mailEnv`.
- Instancia todos los casos de uso e inyecta dependencias.

### 5. API (`back/src/api/`)

**Rutas** (`api.routes.ts`):

| Método | Ruta | Caso de uso |
|--------|------|-------------|
| POST | `/login` | LoginUseCase |
| POST | `/register` | RegisterUseCase |
| POST | `/verify` | VerifyUseCase |
| POST | `/resend-code` | ResendCodeUseCase |
| POST | `/send-password-reset-code` | SendPasswordResetCodeUseCase |
| POST | `/verify-password-reset-code` | VerifyPasswordResetCodeUseCase |
| POST | `/reset-password` | ResetPasswordUseCase |

Montaje en `index.ts`: `app.use('/api/auth', authRoutes)`.

---

## Frontend — Estructura y flujos

### 1. Tipos (`front/src/types/auth.types.ts`)

- `LoginBody`: `{ email, password }`
- `LoginResponse`: `{ token, user: AuthUser }`
- `AuthUser`: `{ id, email, name }`
- `RegisterBody`: `{ name, email, password }`
- `RegisterResponse`: igual que `AuthUser`

### 2. Cliente HTTP (`front/src/api/authClient.ts`)

- **Base URL dinámica**:
  - Android emulator → `http://10.0.2.2:3000/api/auth`
  - iOS / web → `http://localhost:3000/api/auth`
  - Dispositivo físico → cambiar manualmente a tu IP LAN.

- **Métodos**: `login`, `register`, `verifyCode`, `resendCode`, `sendPasswordResetCode`, `verifyPasswordResetCode`, `resetPassword`.

- **Manejo de errores**: si `!response.ok`, lanza `Error` con el `message` del backend.

### 3. Estado global (`front/src/state/AuthContext.tsx`)

- `AuthProvider`: envuelve la app (configurado en `app/_layout.tsx`).
- `useAuthSession()`: expone `session`, `isRestoring`, `signIn`, `signOut`.
- Persistencia: `expo-secure-store` si está disponible, sino `AsyncStorage`.
- Al iniciar la app, `readSession()` restaura la sesión si existe.

### 4. ViewModels (MVVM)

| ViewModel | Archivo | Responsabilidad |
|-----------|---------|-----------------|
| **useAuthViewModel** | `useAuthViewModel.ts` | Login, registro, “olvidé contraseña”. Estados: email, password, loading, error. `handleLogin` llama a `authClient.login` y `signIn`. `handleRegister` llama a `authClient.register` (sin auto-login). `handleSendResetCode` llama a `authClient.sendPasswordResetCode`. |
| **useVerificationViewModel** | `useVerificationViewModel.ts` | Código de 6 dígitos, temporizador 10 min, reenvío. `mode: 'register' | 'reset-password'`. En modo `register`, `handleVerify` hace `signIn` tras verificar. En modo `reset-password`, solo devuelve el resultado para que el padre abra el modal de nueva contraseña. |
| **useResetPasswordViewModel** | `useResetPasswordViewModel.ts` | Nueva contraseña, repetir contraseña, validación, llamada a `authClient.resetPassword`. |

### 5. Componentes y pantallas

| Componente | Archivo | Uso |
|------------|---------|-----|
| **SignInForm** | `sign-form.tsx` | Formulario reutilizable. Con `isRegister` muestra nombre y repetir contraseña. Props: `onForgotPassword`, `onGoToRegister`, `onGoToLogin`. |
| **ForgotPasswordModal** | `forgot-password-modal.tsx` | Modal para introducir email y enviar código de recuperación. |
| **VerificationModal** | `verification-modal.tsx` | Modal para introducir código de 6 dígitos, con temporizador y botón “Reenviar”. |
| **ResetPasswordModal** | `reset-password-modal.tsx` | Modal para nueva contraseña y repetir contraseña. |
| **LoginScreen** | `ui/LoginScreen.tsx` | Formulario de login + flujo completo de “Olvidé contraseña”. |
| **RegisterScreen** | `ui/RegisterScreen.tsx` | Formulario de registro + modal de verificación. |

---

## Flujos de usuario

### Flujo 1: Login

1. Usuario introduce email y contraseña en `SignInForm`.
2. `handleLogin` → `authClient.login` → `POST /api/auth/login`.
3. Si éxito: `signIn(token, user)` guarda sesión y redirige a `/main`.
4. Si error: se muestra el mensaje del backend.

### Flujo 2: Registro con verificación

1. Usuario introduce nombre, email, contraseña y repetir contraseña.
2. `handleRegisterWithVerification` → `handleRegister` → `authClient.register` → `POST /api/auth/register`.
3. Backend: guarda usuario con `isVerified: false`, envía código por email.
4. Se abre `VerificationModal` con el email registrado.
5. Usuario introduce el código de 6 dígitos.
6. `handleVerify` → `authClient.verifyCode` → `POST /api/auth/verify`.
7. Backend: marca `isVerified: true`, devuelve JWT.
8. `signIn(token, user)` y redirección a `/main`.

### Flujo 3: Olvidé mi contraseña

1. En Login, el usuario pulsa “¿Olvidaste tu contraseña?”.
2. Se abre `ForgotPasswordModal`; introduce su email.
3. `handleSendCode` → `authClient.sendPasswordResetCode` → `POST /api/auth/send-password-reset-code`.
4. Se cierra el modal de email y se abre `VerificationModal`.
5. Usuario introduce el código recibido.
6. `handleVerifyCode` → `authClient.verifyPasswordResetCode` → `POST /api/auth/verify-password-reset-code`.
7. Si OK: se guarda el código, se cierra el modal de verificación y se abre `ResetPasswordModal`.
8. Usuario introduce nueva contraseña y repetir.
9. `handleResetPassword` → `authClient.resetPassword` → `POST /api/auth/reset-password`.
10. Si OK: se cierran todos los modales y el usuario puede iniciar sesión con la nueva contraseña.

---

## Configuración y arranque

### Variables de entorno (backend)

Crear `.env` en la raíz del proyecto (ej. `TFG-Rnative/`):

```env
# Obligatorias
AUTH_DB_URI=mongodb://127.0.0.1:27017/tu_db
AUTH_JWT_SECRET=tu_secreto_largo_y_aleatorio

# Opcionales
PORT=3000
AUTH_JWT_EXPIRES_IN=1d
AUTH_BCRYPT_ROUNDS=10

# Email (desarrollo)
MAIL_MODE=console

# Email (producción)
# MAIL_MODE=smtp
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_SECURE=false
# MAIL_USER=tu_email@gmail.com
# MAIL_PASS=tu_app_password
# MAIL_FROM="Tu App <no-reply@tuapp.com>"
```

### Arrancar backend

```bash
npx tsx features/auth/back/src/index.ts
```

### Arrancar frontend

```bash
npm run start
```

### Dispositivo físico

- Cambiar la base URL en `front/src/api/authClient.ts` por tu IP LAN (ej. `http://192.168.1.50:3000/api/auth`).

---

## Portabilidad del módulo

Para reutilizar este módulo en otro proyecto:

- **Más estables**: `back/src/domain/**`, `back/src/application/**`.
- **Adaptables**:
  - `back/src/infrastructure/persistence/**` (BD distinta).
  - `front/src/api/authClient.ts` (URL, headers).
  - `front/src/state/AuthContext.tsx` (otro sistema de sesión).
  - Integración con el router principal (`app/_layout.tsx`, rutas `/`, `/register`, `/main`).

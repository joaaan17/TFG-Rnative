# Desplegar el backend en Railway o Render

Guía para desplegar el **servidor Express** (API) en Railway o Render. Necesitas **MongoDB Atlas** (o similar) como base de datos.

## Requisitos previos

1. **MongoDB Atlas** (gratis): [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Crea un cluster y obtén la URI de conexión
   - Whitelist IP `0.0.0.0/0` para permitir conexiones desde cualquier IP (Railway/Render)

2. **Claves externas**:
   - `OPENAI_API_KEY` (Consultorio IA + noticias educativas)
   - `NEWS_API_KEY` (NewsAPI para noticias)

## Variables de entorno necesarias

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `AUTH_DB_URI` | ✅ | URI de MongoDB (ej. `mongodb+srv://user:pass@cluster.mongodb.net/tfg`) |
| `AUTH_JWT_SECRET` | ✅ | Secreto para firmar JWT (cadena larga aleatoria) |
| `OPENAI_API_KEY` | ✅ | Clave de OpenAI (Consultorio + quizzes) |
| `NEWS_API_KEY` | ✅ | Clave de NewsAPI (headlines) |
| ~~`AUTH_JWT_EXPIRES_IN`~~ | — | **Eliminada**: los tokens JWT no expiran (sesión hasta signOut) |
| `AUTH_BCRYPT_ROUNDS` | | Por defecto `10` |
| `AUTH_ADMIN_EMAILS` | | Emails separados por coma (admins pueden borrar cuentas) |
| `PORTFOLIO_INITIAL_CASH` | | Efectivo inicial por usuario (default 10000) |

---

## Opción A: Railway

### 1. Crear cuenta
- [railway.app](https://railway.app) → Sign up (GitHub)

### 2. Nuevo proyecto
- **New Project** → **Deploy from GitHub repo**
- Selecciona tu repositorio

### 3. Configuración
Railway detecta automáticamente el `Procfile` o `railway.json`:
- **Build**: `npm install`
- **Start**: `npm run start:server`

### 4. Variables de entorno
- **Variables** → **Add Variable**
- Añade todas las variables de la tabla anterior
- Para `AUTH_JWT_SECRET`: genera una con `openssl rand -base64 32`

### 5. MongoDB
- Opción 1: Usa MongoDB Atlas y pega la URI en `AUTH_DB_URI`
- Opción 2: **New** → **Database** → **MongoDB** (Railway te da la URI)

### 6. Deploy
- Railway despliega al hacer push a la rama conectada
- Obtendrás una URL como `https://tu-proyecto.up.railway.app`

### 7. Dominio público
- **Settings** → **Networking** → **Generate Domain**
- Copia la URL (ej. `https://xxx.up.railway.app`) para usarla como `EXPO_PUBLIC_API_URL` en Vercel

---

## Opción B: Render

### 1. Crear cuenta
- [render.com](https://render.com) → Sign up (GitHub)

### 2. Nuevo Web Service
- **New** → **Web Service**
- Conecta tu repositorio
- Branch: `main` (o la que uses)

### 3. Configuración
Si existe `render.yaml` en la raíz, Render lo usará. Si no, configura manualmente:
- **Build Command**: `npm install`
- **Start Command**: `npm run start:server`
- **Instance Type**: Free (o paid para producción)

### 4. Variables de entorno
- **Environment** → **Add Environment Variable**
- Añade todas las variables necesarias
- `AUTH_JWT_SECRET`: genera con `openssl rand -base64 32`

### 5. Deploy
- **Create Web Service**
- Obtendrás una URL como `https://tfg-api.onrender.com`

### 6. Nota sobre Free Tier
- El free tier "duerme" tras inactividad
- La primera petición puede tardar 30–60 segundos en despertar
- Para producción estable, usa plan de pago

---

## Conectar frontend (Vercel) con backend

Tras desplegar el backend:

1. Copia la URL pública del backend (ej. `https://tu-api.up.railway.app`)
2. En **Vercel** → tu proyecto → **Settings** → **Environment Variables**
3. Añade: `EXPO_PUBLIC_API_URL` = `https://tu-api.up.railway.app` (sin `/` final)
4. Redeploy el frontend en Vercel

---

## CORS

El servidor usa `cors()` sin restricciones, lo que permite peticiones desde cualquier origen (incluido tu dominio de Vercel). Para producción más estricta, puedes restringir en `server/index.ts`:

```ts
app.use(cors({ origin: 'https://tu-app.vercel.app' }));
```

---

## Probar localmente con backend remoto

En `.env` local (o `.env.local`):
```
EXPO_PUBLIC_API_URL=https://tu-api.up.railway.app
```

Luego `npm run web` usará ese backend en lugar de localhost.

# Desplegar la app web en Vercel

Esta guía cubre el despliegue del **frontend web** (Expo/React Native) en Vercel. El **backend** (Express + MongoDB) debe desplegarse por separado. Ver [BACKEND_DEPLOY.md](./BACKEND_DEPLOY.md) para Railway o Render.

## Requisitos previos

1. Cuenta en [Vercel](https://vercel.com)
2. Backend desplegado y accesible por URL (ej. `https://tu-api.railway.app`)
3. Repositorio en GitHub/GitLab/Bitbucket

## Pasos

### 1. Conectar el repositorio

1. Entra en [vercel.com](https://vercel.com) e inicia sesión
2. **Add New** → **Project**
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente el `vercel.json`

### 2. Configurar variables de entorno

En **Settings → Environment Variables** añade:

| Variable | Valor | Notas |
|----------|-------|-------|
| `EXPO_PUBLIC_API_URL` | `https://tu-backend-url.com` | URL del backend (sin `/` final) |

El frontend usa esta variable para las llamadas a la API (auth, perfil, noticias, inversiones, etc.).

### 3. Deploy

Vercel usará por defecto:

- **Build Command**: `npx expo export -p web`
- **Output Directory**: `dist`
- **Framework**: None

Pulsa **Deploy**. Tras unos minutos tendrás la URL de tu app.

### 4. (Opcional) Deploy desde terminal

Con [Vercel CLI](https://vercel.com/docs/cli) instalado:

```bash
npm i -g vercel
vercel
```

Sigue las indicaciones y define `EXPO_PUBLIC_API_URL` cuando te lo pida.

## Scripts disponibles

```bash
npm run build:web    # Genera la build web en dist/
npm run web         # Desarrollo local en web
```

## Estructura de despliegue

- Solo se despliega el **frontend estático** (HTML, JS, CSS)
- El backend (`server/`) **no** se incluye en este deploy
- Debes tener el backend en otro servicio (Railway, Render, Vercel Serverless, etc.) con CORS configurado

## Problemas frecuentes

- **CORS**: El backend debe permitir requests desde tu dominio de Vercel (ej. `https://tu-app.vercel.app`)
- **API URL**: Comprueba que `EXPO_PUBLIC_API_URL` apunte al backend correcto y que las variables empiecen por `EXPO_PUBLIC_` para estar disponibles en el cliente

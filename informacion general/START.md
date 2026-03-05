# Cómo arrancar la app

## Requisitos

- **Node.js** (LTS)
- **MongoDB** (local o Atlas)
- **Expo Go** (opcional, para probar en móvil)

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar variables de entorno

Crea o edita el archivo `.env` en la raíz del proyecto con:

```
AUTH_DB_URI=mongodb://localhost:27017/tfg
AUTH_JWT_SECRET=tu-secreto-jwt
AUTH_ADMIN_EMAILS=tu@email.com
```

- Para MongoDB Atlas, usa la URI de conexión que te proporciona.
- `AUTH_ADMIN_EMAILS` (opcional): emails de admins separados por coma. Los admins pueden eliminar cualquier cuenta.

## 3. Arrancar el backend

En una terminal:

```bash
npx tsx server/index.ts
```

El servidor quedará en `http://localhost:3000`.

## 4. Arrancar el frontend

En otra terminal:

```bash
npm start
```

Luego elige:

- `a` para Android
- `i` para iOS
- `w` para web

O usa directamente:

```bash
npm run android
npm run ios
npm run web
```

## Resumen rápido

1. `npm install`
2. Configurar `.env` (AUTH_DB_URI, AUTH_JWT_SECRET)
3. Terminal 1: `npx tsx server/index.ts`
4. Terminal 2: `npm start`

# Estructura del backend general de la app

Este documento describe **cómo estructurar el backend general** de la aplicación, teniendo en cuenta la arquitectura Clean/Hexagonal del módulo Auth y la organización modular por features.

---

## Índice

1. [Estado actual: Auth como modelo](#estado-actual-auth-como-modelo)
2. [Principios de la arquitectura Auth](#principios-de-la-arquitectura-auth)
3. [Opciones de estructura para el backend general](#opciones-de-estructura-para-el-backend-general)
4. [Recomendación: Backend modular orquestado](#recomendación-backend-modular-orquestado)
5. [Cómo añadir nuevas features con backend](#cómo-añadir-nuevas-features-con-backend)
6. [Infraestructura compartida vs. por feature](#infraestructura-compartida-vs-por-feature)
7. [Resumen de reglas prácticas](#resumen-de-reglas-prácticas)

---

## Estado actual: Auth como modelo

Tu módulo Auth tiene una estructura **autocontenida** dentro de la feature:

```
features/auth/
├── back/src/                    # Backend de la feature
│   ├── domain/                  # Tipos e interfaces puras
│   ├── application/usecases/    # Casos de uso (reglas de negocio)
│   ├── infrastructure/          # Mongo, Bcrypt, JWT, Nodemailer
│   ├── config/                  # env + wiring (inyección de dependencias)
│   ├── api/                     # Controladores y rutas Express
│   └── index.ts                 # Entrada: Express + Mongoose + monta rutas
└── front/src/                   # Frontend (MVVM)
```

**Punto importante**: El backend de Auth se arranca solo (`npx tsx features/auth/back/src/index.ts`). Crea su propia app Express, conecta a Mongo y monta `/api/auth/*`.

---

## Principios de la arquitectura Auth

Estos principios deben conservarse al escalar:

| Principio                | Significado                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| **Dominio puro**         | `domain/` y `application/` no importan Express, Mongo ni librerías de infra.                      |
| **Puertos (interfaces)** | El dominio define contratos (`AuthRepository`, `PasswordService`, etc.); la infra los implementa. |
| **Casos de uso**         | Lógica de negocio en clases inyectables que reciben dependencias por constructor.                 |
| **Wiring centralizado**  | `config/auth.wiring.ts` instancia repos, servicios y casos de uso.                                |
| **Rutas delgadas**       | Los controladores solo parsean `req.body`, llaman al caso de uso y devuelven la respuesta.        |

---

## Opciones de estructura para el backend general

### Opción A: Múltiples servidores (microservicios por feature)

```
features/auth/back/src/index.ts     → Puerto 3000 (auth)
features/news/back/src/index.ts     → Puerto 3001 (news)
features/investments/back/src/index.ts → Puerto 3002 (investments)
```

- **Pros**: Despliegue independiente, escalado por feature.
- **Contras**: CORS entre servicios, más complejidad operativa, no es lo que tienes ahora.

### Opción B: Monolito clásico (un solo backend)

```
backend/
├── src/
│   ├── domain/        # Entidades globales
│   ├── application/   # Casos de uso mezclados
│   ├── infrastructure/
│   └── api/           # Todas las rutas
└── index.ts
```

- **Pros**: Un solo servidor, simple de desplegar.
- **Contras**: Rompe el modelo por feature; Auth está autocontenido, esto lo separaría.

### Opción C: Backend modular orquestado (recomendada)

Mantener el patrón **back dentro de cada feature** y un **servidor orquestador** que monta todo:

```
TFG-Rnative/
├── server/                        # Orquestador (punto de entrada único)
│   ├── index.ts                   # Express + Mongo + monta rutas de features
│   └── config/
│       └── env.ts                 # Variables compartidas (DB, PORT)
│
├── features/
│   ├── auth/back/                 # Feature Auth (como ahora)
│   │   └── src/
│   │       ├── domain/
│   │       ├── application/
│   │       ├── infrastructure/
│   │       ├── config/
│   │       └── api/               # Exporta router
│   │
│   ├── news/back/                 # Feature News (cuando exista)
│   │   └── src/
│   │       ├── domain/
│   │       ├── application/
│   │       └── api/
│   │
│   ├── investments/back/          # Feature Inversiones
│   └── dashboard/back/            # Feature Dashboard
```

- **Pros**: Respeta el modelo Auth; cada feature es un módulo; un solo servidor; fácil añadir features.
- **Contras**: Requiere un pequeño refactor: mover la creación de `app` y la conexión a Mongo al orquestador.

---

## Recomendación: Backend modular orquestado

### 1. Servidor orquestador (`server/` o `backend/` en la raíz)

Responsabilidades:

- Crear la app Express.
- Conectar a MongoDB (una sola conexión).
- Montar rutas de cada feature: `app.use('/api/auth', authRoutes)`.
- CORS, JSON, manejo global de errores.
- Arrancar el servidor en un puerto.

Ejemplo de estructura:

```
server/
├── index.ts              # Punto de entrada
├── app.ts                # Configuración de Express (opcional)
└── config/
    └── env.ts            # AUTH_DB_URI, PORT, etc.
```

### 2. Cada feature exporta su router

En `features/auth/back/src/api/api.routes.ts` (o un barrel):

```ts
// features/auth/back/src/api/index.ts
export { default as authRoutes } from './api.routes';
```

El orquestador importa y monta:

```ts
import { authRoutes } from '../features/auth/back/src/api';
app.use('/api/auth', authRoutes);
```

### 3. Conexión a MongoDB centralizada

- El orquestador llama a `mongoose.connect(authEnv.dbUri)` una vez.
- Las features que usan Mongo no abren conexiones propias; usan la conexión global de Mongoose.

### 4. Wiring por feature

- Cada feature mantiene su `config/X.wiring.ts` y sus casos de uso.
- Los controladores de la feature importan sus casos de uso desde el wiring de la feature.

---

## Cómo añadir nuevas features con backend

Para una nueva feature (ej. **News** o **Inicio**):

### Paso 1: Crear la estructura

```
features/Inicio/
├── back/
│   └── src/
│       ├── domain/
│       │   ├── news.types.ts
│       │   └── ports.ts
│       ├── application/usecases/
│       │   ├── get-news.ts
│       │   └── get-news-by-id.ts
│       ├── infrastructure/
│       │   └── persistence/mongo/
│       │       ├── news.model.ts
│       │       └── mongoNewsRepository.ts
│       ├── config/
│       │   └── news.wiring.ts
│       └── api/
│           ├── news.controller.ts
│           └── api.routes.ts
└── front/   # Ya existe
```

### Paso 2: Seguir el mismo patrón que Auth

- **Domain**: tipos e interfaces (`NewsRepository`, etc.).
- **Application**: casos de uso que reciben el repo por constructor.
- **Infrastructure**: implementación Mongo.
- **API**: controladores delgados que llaman al caso de uso.

### Paso 3: Registrar en el orquestador

```ts
import { authRoutes } from '../features/auth/back/src/api';
import { newsRoutes } from '../features/Inicio/back/src/api';

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
```

---

## Infraestructura compartida vs. por feature

| Elemento                     | Recomendación                 | Motivo                                                                                           |
| ---------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| **MongoDB**                  | Conexión única en orquestador | Una sola conexión por proceso.                                                                   |
| **JWT / TokenService**       | Compartir o duplicar          | Si varias features validan JWT, puede haber un `shared/tokens/`; si solo Auth, mantener en Auth. |
| **Bcrypt / PasswordService** | En Auth                       | Solo Auth hashea contraseñas.                                                                    |
| **MailService**              | En Auth                       | Solo Auth envía emails de verificación.                                                          |
| **Modelos Mongoose**         | Por feature                   | Cada feature tiene sus modelos en `infrastructure/persistence/mongo/`.                           |
| **Variables de entorno**     | Por feature + globales        | `AUTH_DB_URI` puede ser `DB_URI` global; `AUTH_JWT_SECRET` en Auth.                              |

### Carpeta `shared/` en el backend (opcional)

Si varias features necesitan lógica común:

```
server/
├── shared/
│   ├── tokens/           # JWT si lo usan varias features
│   ├── middleware/       # authMiddleware (verificar JWT)
│   └── errors/           # handlers de error global
└── index.ts
```

---

## Resumen de reglas prácticas

1. **Una feature = un módulo**: Si la feature tiene backend, vive en `features/X/back/` con domain, application, infrastructure, config y api.
2. **Un servidor, múltiples features**: El orquestador en `server/` monta las rutas de cada feature bajo `/api/{feature}`.
3. **Conexión a BD única**: Mongoose se conecta una vez en el orquestador; las features solo usan modelos.
4. **Patrón por feature**: Dominio puro, puertos, casos de uso inyectables, controladores delgados.
5. **Wiring por feature**: Cada feature tiene su `config/X.wiring.ts`; no un wiring global gigante.
6. **Rutas nominales**: `/api/auth/*`, `/api/news/*`, `/api/investments/*`, etc.

---

## Migración gradual desde el estado actual

Si quieres pasar del estado actual (Auth con su propio `index.ts`) al modelo orquestado:

1. Crear `server/index.ts` que importe `authRoutes` y monte `/api/auth`.
2. Mover la conexión a Mongo y el `app.listen` de `features/auth/back/src/index.ts` al orquestador.
3. Dejar en Auth solo la definición de rutas y casos de uso; quitar el `index.ts` que arranca el servidor.
4. Cambiar el comando de arranque: `npx tsx server/index.ts` en lugar de `npx tsx features/auth/back/src/index.ts`.

Mientras tanto, puedes seguir arrancando Auth como hasta ahora y diseñar las nuevas features siguiendo este patrón para integrarlas más adelante.

---

_Última actualización: Febrero 2026_

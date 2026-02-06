# Plantilla para crear una Feature

Este documento describe la **estructura estándar** para crear cualquier feature en el proyecto, basada en el módulo `auth`. Sirve como guía para mantener consistencia arquitectónica.

---

## Índice

1. [Estructura de carpetas](#estructura-de-carpetas)
2. [Backend (Clean / Hexagonal)](#backend-clean--hexagonal)
3. [Frontend (MVVM + Service)](#frontend-mvvm--service)
4. [Reglas de arquitectura](#reglas-de-arquitectura)
5. [Checklist para nueva feature](#checklist-para-nueva-feature)

---

## Estructura de carpetas

```
features/{feature}/
├── back/src/                    # Backend (Node.js + Express + Mongoose)
│   ├── domain/                  # Contratos puros (tipos, interfaces)
│   │   ├── {feature}.types.ts   # Entidades del dominio
│   │   └── ports.ts             # Interfaces (Repository, Servicios externos)
│   ├── application/usecases/    # Casos de uso (reglas de negocio)
│   │   └── *.ts                 # Un archivo por caso de uso
│   ├── infrastructure/          # Adaptadores concretos
│   │   ├── persistence/         # Mongo, in-memory, etc.
│   │   │   ├── index.ts         # In-memory (opcional)
│   │   │   └── mongo/
│   │   │       ├── {entidad}.model.ts
│   │   │       └── mongoRepository.ts
│   │   └── ...                  # Otros adaptadores (mail, crypto, etc.)
│   ├── config/
│   │   ├── {feature}.env.ts     # Variables de entorno
│   │   └── {feature}.wiring.ts  # Inyección de dependencias
│   └── api/
│       ├── api.routes.ts        # Rutas Express
│       ├── {feature}.controller.ts
│       └── http.types.ts        # Tipos HTTP agnósticos (opcional)
│
└── front/src/                   # Frontend (Expo / React Native)
    ├── api/
    │   └── {feature}Client.ts   # HTTP puro (fetch)
    ├── services/
    │   └── {feature}Service.ts  # Lógica frontend (validaciones, llamadas al client)
    ├── state/
    │   ├── use{Feature}ViewModel.ts
    │   └── use{Feature}FlowViewModel.ts  # Si hay flujos complejos
    ├── types/
    │   └── {feature}.types.ts
    ├── components/              # Componentes reutilizables de la feature
    ├── ui/                      # Pantallas
    │   ├── {Feature}Screen.tsx
    │   └── {Feature}.styles.ts
    └── index.ts                 # Barrel export
```

---

## Backend (Clean / Hexagonal)

### 1. Domain (`back/src/domain/`)

- **`{feature}.types.ts`**: Entidades del dominio (sin dependencias de Express/Mongo).
- **`ports.ts`**: Interfaces que el dominio espera (Repository, servicios externos).

Regla: **El dominio no importa Express, Mongo ni librerías de infraestructura.**

### 2. Application (`back/src/application/usecases/`)

- Un archivo por caso de uso: `get-x.ts`, `create-x.ts`, `update-x.ts`, etc.
- Cada caso de uso recibe dependencias por constructor (inyección).
- Solo llama a interfaces (ports), nunca a implementaciones concretas.

### 3. Infrastructure (`back/src/infrastructure/`)

- Implementaciones de los puertos: Mongo, Bcrypt, JWT, Nodemailer, etc.
- Mapea modelos de persistencia (`_id`) al dominio (`id`).

### 4. Config (`back/src/config/`)

- **`{feature}.env.ts`**: Lectura de variables de entorno.
- **`{feature}.wiring.ts`**: Instancia repositorios, servicios y casos de uso.

### 5. API (`back/src/api/`)

- **`api.routes.ts`**: Define rutas (`router.get`, `router.post`, etc.).
- **`{feature}.controller.ts`**: Controladores delgados que llaman a los casos de uso.
- Montaje: `app.use('/api/{feature}', routes)` en el servidor orquestador.

---

## Frontend (MVVM + Service)

### Capas (de arriba a abajo)

```
Screen (UI)
    ↓
ViewModel (estado + flujo UI)
    ↓
Service (lógica frontend de la feature)
    ↓
Client (HTTP puro)
    ↓
Backend
```

### 1. Client (`front/src/api/{feature}Client.ts`)

- **HTTP puro**: solo `fetch`, base URL dinámica, parseo de respuesta.
- No contiene validaciones ni lógica de negocio.
- Base URL según plataforma: Android emulator (`10.0.2.2`), iOS/web (`localhost`), dispositivo físico (IP LAN).

### 2. Service (`front/src/services/{feature}Service.ts`)

- **Única capa que usa el Client**.
- Centraliza validaciones (trim, campos obligatorios, formatos).
- Centraliza criterios de error (`extractErrorMessage`).
- Expone métodos limpios que los ViewModels llaman.

Regla: **El Client nunca se usa fuera del Service.**

### 3. ViewModel (`front/src/state/`)

- Gestiona **estado** (loading, error, datos).
- Gestiona **flujo UI** (qué modal abrir, qué paso mostrar).
- Llama al **Service**, nunca al Client.
- No contiene lógica HTTP ni validaciones duplicadas.

Regla: **El ViewModel nunca habla HTTP directamente.**

### 4. Screen / UI (`front/src/ui/`)

- Renderiza componentes.
- Lee estado del ViewModel.
- Pasa handlers del ViewModel a los componentes.
- No contiene lógica de flujo ni llamadas al Service/Client.

### 5. Types (`front/src/types/`)

- Interfaces y tipos compartidos (request/response, estados).

### 6. Components (`front/src/components/`)

- Componentes reutilizables dentro de la feature (modales, formularios, etc.).

---

## Reglas de arquitectura

| Regla | Significado |
|-------|-------------|
| **ViewModel nunca habla HTTP** | Solo usa el Service. |
| **Client nunca fuera del Service** | Solo el Service importa el Client. |
| **Dominio puro (backend)** | Sin imports de Express/Mongo en domain/ y application/. |
| **Controladores delgados** | Solo parsean `req.body`, llaman al caso de uso y devuelven respuesta. |
| **Screen "tonta"** | Solo renderiza y conecta props/handlers del ViewModel. |

---

## Checklist para nueva feature

### Backend

- [ ] `domain/{feature}.types.ts` — Entidades
- [ ] `domain/ports.ts` — Interfaces
- [ ] `application/usecases/*.ts` — Casos de uso
- [ ] `infrastructure/persistence/` — Repositorio (Mongo o in-memory)
- [ ] `config/{feature}.env.ts` — Variables de entorno
- [ ] `config/{feature}.wiring.ts` — Wiring
- [ ] `api/api.routes.ts` — Rutas
- [ ] `api/{feature}.controller.ts` — Controladores
- [ ] Registrar rutas en el servidor orquestador: `app.use('/api/{feature}', routes)`

### Frontend

- [ ] `api/{feature}Client.ts` — HTTP puro
- [ ] `services/{feature}Service.ts` — Lógica frontend (validaciones, llamadas al Client)
- [ ] `types/{feature}.types.ts` — Tipos
- [ ] `state/use{Feature}ViewModel.ts` — ViewModel principal
- [ ] `ui/{Feature}Screen.tsx` — Pantalla
- [ ] `ui/{Feature}.styles.ts` — Estilos
- [ ] `components/` — Componentes si aplica
- [ ] `index.ts` — Barrel export
- [ ] Configurar ruta en `app/` (Expo Router)

### Integración

- [ ] Añadir ruta en `app/_layout.tsx` si es nueva pantalla
- [ ] Añadir ruta en `server/index.ts` si tiene backend

---

*Basado en la estructura de `features/auth`. Última actualización: Febrero 2026.*

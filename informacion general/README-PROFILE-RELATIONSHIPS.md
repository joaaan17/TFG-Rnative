# Módulos Profile y Relationships

Este documento describe el funcionamiento del módulo **Profile** (perfil de usuario) y su integración con el módulo **Relationships** (amistades/solicitudes). Ambos siguen una arquitectura feature-based con capas separadas (domain, application, infrastructure, api) y un frontend basado en MVVM + Service.

---

## Índice

1. [Visión general](#visión-general)
2. [Arquitectura general](#arquitectura-general)
3. [Módulo Profile](#módulo-profile)
4. [Módulo Relationships](#módulo-relationships)
5. [Integración Profile ↔ Relationships](#integración-profile--relationships)
6. [Flujos de usuario](#flujos-de-usuario)
7. [Dependencias entre features](#dependencias-entre-features)

---

## Visión general

- **Profile**: Gestiona los datos del perfil de usuario (nombre, username, estadísticas B/F, nivel, división, patrimonio, etc.) y la búsqueda de usuarios. Los perfiles se almacenan en la colección `profiles` de MongoDB.
- **Relationships**: Gestiona las relaciones de amistad entre usuarios (solicitudes pendientes, amigos, bloqueos). La fuente de verdad es la colección `relationships`; no se usan arrays de amigos dentro de `profiles`.

La pantalla de perfil (`ProfileScreen`) es el punto de entrada principal y orquesta tanto la visualización del perfil como las acciones de amistad (buscar, agregar, ver solicitudes, aceptar/rechazar).

---

## Arquitectura general

### Backend (Clean / Hexagonal)

```
domain/          → Tipos, interfaces (ports), reglas puras
application/     → Casos de uso (lógica de negocio)
infrastructure/  → Implementaciones concretas (MongoDB)
config/          → Wiring, variables de entorno
api/             → Rutas Express, controladores
```

### Frontend (MVVM + Service)

```
Screen (UI)      → Renderiza, conecta props/handlers
    ↓
ViewModel        → Estado, flujo UI, llama al Service
    ↓
Service          → Validaciones, llamadas al Client
    ↓
Client           → HTTP puro (fetch)
    ↓
Backend
```

### Principios

- **ViewModel nunca habla HTTP**: Solo usa el Service.
- **Client nunca fuera del Service**: Solo el Service importa el Client.
- **Modales presentacionales**: Emiten eventos; no conocen navegación ni servicios.
- **Screen como orquestador**: Conoce el router, conecta modales con ViewModel y decide navegación.

---

## Módulo Profile

### Estructura de carpetas

```
features/profile/
├── back/src/
│   ├── domain/
│   │   ├── profile.types.ts    # Entidad Profile
│   │   └── ports.ts            # ProfileRepository, ProfileSearchResult
│   ├── application/usecases/
│   │   ├── get-profile.ts
│   │   ├── create-profile.ts
│   │   ├── delete-profile.ts
│   │   └── search-profiles.ts
│   ├── infrastructure/persistence/mongo/
│   │   ├── profile.model.ts    # Mongoose schema
│   │   └── mongoRepository.ts  # MongoProfileRepository
│   ├── config/
│   │   ├── profile.env.ts
│   │   └── profile.wiring.ts
│   └── api/
│       ├── api.routes.ts
│       └── profile.controller.ts
└── front/src/
    ├── api/profileClient.ts
    ├── services/profileService.ts
    ├── state/useProfileViewModel.ts
    ├── types/profile.types.ts
    ├── components/
    │   ├── add-friends-modal.tsx
    │   ├── pending-requests-modal.tsx
    │   ├── profileAvatar.tsx
    │   └── settings-modal.tsx
    └── ui/
        ├── ProfileScreen.tsx
        └── Profile.styles.ts
```

### Backend Profile

#### Dominio

- **`Profile`**: Entidad con `id`, `name`, `username`, `avatarUrl`, `joinedAt`, `bf`, `nivel`, `division`, `patrimonio`, `following`, `followers`.
- **`ProfileRepository`**: Port con `findById`, `save`, `deleteById`, `searchProfiles`.
- **`ProfileSearchResult`**: Resultado de búsqueda con `id`, `name`, `username?`, `avatarUrl?`.

#### Casos de uso

| Caso de uso      | Descripción                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| `GetProfile`     | Obtiene el perfil por `userId`.                                               |
| `CreateProfile`  | Crea/actualiza perfil (upsert).                                               |
| `DeleteProfile`  | Elimina perfil por `id`.                                                      |
| `SearchProfiles` | Busca perfiles por nombre/username con prefijo, excluyendo al usuario actual. |

#### API Profile

| Método | Ruta                                  | Auth | Descripción                                       |
| ------ | ------------------------------------- | ---- | ------------------------------------------------- |
| GET    | `/api/profile/:id`                    | No   | Obtener perfil por ID.                            |
| GET    | `/api/profile/search?q=&page=&limit=` | Sí   | Buscar perfiles (excluye al usuario autenticado). |

#### Modelo MongoDB (Profile)

- Campos: `name`, `username`, `usernameLower`, `nameLower`, `avatarUrl`, `joinedAt`, `bf`, `nivel`, `division`, `patrimonio`, `following`, `followers`.
- `usernameLower` y `nameLower` se usan para búsquedas insensibles a mayúsculas.
- `_id` del documento coincide con el `userId` del usuario.

### Frontend Profile

#### profileClient

- `getProfile(userId)`: GET `/api/profile/:id`.
- `searchProfiles(q, page, limit, token)`: GET `/api/profile/search` con auth.

#### profileService

- `getProfile(userId)`.
- `searchProfiles(q, token, page, limit)` con validaciones.
- `extractErrorMessage(err, fallback)`.

#### useProfileViewModel

Centraliza el estado y la lógica del perfil y de las relaciones usadas desde la pantalla:

**Estado:**

- `profile`, `isLoading`, `error`: datos del perfil actual.
- `user`: datos de sesión (auth).
- `showSettingsModal`, `showAddFriendsModal`, `showRequestsModal`: visibilidad de modales.
- `searchFriendsValue`, `searchResults`, `searchLoading`, `searchError`, `requestedIds`: búsqueda y envío de solicitudes.
- `pendingRequests`, `pendingLoading`, `pendingError`, `processingIds`: solicitudes recibidas.
- `isDeleting`, `deleteError`: eliminación de cuenta.

**Handlers:**

- `handleSignOut`, `handleDeleteAccount`: auth/cuenta.
- `handleRequestFriend(targetUserId)`: envía solicitud (vía `relationshipsService`).
- `handleAcceptRequest(fromUserId)`, `handleRejectRequest(fromUserId)`: aceptar/rechazar solicitudes.
- `closeSettingsModal`, `closeAddFriendsModal`, `closeRequestsModal`, `clearDeleteError`.

**Efectos:**

- Carga del perfil al montar (cuando hay `session.user.id`).
- Búsqueda con debounce (350 ms) cuando `searchFriendsValue` cambia y el modal de agregar amigos está abierto.
- Carga de solicitudes pendientes cuando se abre el modal "Ver Solicitudes".

#### ProfileScreen

- Usa `useProfileViewModel` y `useRouter`.
- Renderiza la tarjeta de perfil, estadísticas (B/F, siguiendo, seguidores), resumen (nivel, división, patrimonio) y logros.
- Botones: "Agregar Amigos", "Ver Solicitudes", icono de ajustes.
- Modales: `AddFriendsModal`, `PendingRequestsModal`, `SettingsModal`.
- Orquesta navegación: tras sign out o borrado de cuenta exitoso ejecuta `router.replace('/')`.

#### Modales presentacionales

- **SettingsModal**: Muestra datos del usuario, emite `onRequestSignOut`, `onConfirmDelete`, `onCancelDelete`. No conoce router.
- **AddFriendsModal**: Buscador, lista de resultados, botón "Enviar solicitud" por usuario. Emite `onRequestFriend`, `onClose`.
- **PendingRequestsModal**: Lista de solicitudes con "Aceptar" y "Rechazar". Emite `onAccept`, `onReject`, `onClose`.

---

## Módulo Relationships

### Estructura de carpetas

```
features/relationships/
├── back/src/
│   ├── domain/
│   │   ├── relationship.types.ts   # Relationship, ProfileSummary, RelationshipStatus
│   │   ├── relationship.errors.ts  # Conflict, Forbidden, NotFound
│   │   ├── relationship.ports.ts   # RelationshipRepository, ProfileReaderPort
│   │   └── normalizePair.ts        # Ordena userAId/userBId para evitar duplicados
│   ├── application/relationships/
│   │   ├── request-friendship.ts
│   │   ├── accept-friendship.ts
│   │   ├── reject-friendship.ts
│   │   ├── delete-friend.ts
│   │   ├── list-friends.ts
│   │   └── list-pending-requests.ts
│   ├── infrastructure/persistence/mongo/
│   │   ├── relationship.model.ts
│   │   ├── relationship.repository.ts
│   │   └── profileReader.ts        # Adaptador que usa ProfileModel
│   ├── config/relationships.wiring.ts
│   └── api/
│       ├── relationships.routes.ts
│       └── relationships.controller.ts
└── front/src/
    ├── api/relationshipsClient.ts
    └── services/relationshipsService.ts
```

### Backend Relationships

#### Modelo de datos

- Un documento por pareja de usuarios.
- `userAId`, `userBId`: ordenados para evitar duplicados (`normalizePair`).
- `requesterId`: usuario que envía la solicitud.
- `status`: `"pending"` | `"accepted"` | `"blocked"`.

#### Dominio

- **Relationship**: `id`, `userAId`, `userBId`, `requesterId`, `status`, `createdAt`, `updatedAt`.
- **ProfileSummary**: `userId`, `username?`, `name`, `avatarUrl?`.
- **RelationshipRepository**: `findByPair`, `create`, `updateStatus`, `deleteByPair`, `findAcceptedFriendIds`, `findPendingRequesterIds`.
- **ProfileReaderPort**: `findByUserIds`, `searchByUserIdsAndQuery` (usado para obtener datos de perfiles desde la colección `profiles`).

#### Casos de uso

| Caso de uso           | Descripción                                                     |
| --------------------- | --------------------------------------------------------------- |
| `requestFriendship`   | Envía solicitud. No permite auto-solicitud ni duplicados.       |
| `acceptFriendship`    | Acepta solicitud. Solo el receptor puede aceptar.               |
| `rejectFriendship`    | Rechaza o cancela solicitud pendiente.                          |
| `deleteFriend`        | Elimina amistad (solo si `status === "accepted"`).              |
| `listFriends`         | Lista amigos paginado, con búsqueda opcional por username/name. |
| `listPendingRequests` | Lista usuarios que han enviado solicitud al usuario actual.     |

#### API Relationships (todas con auth)

| Método | Ruta                                              | Descripción                        |
| ------ | ------------------------------------------------- | ---------------------------------- |
| POST   | `/api/relationships/request`                      | Enviar solicitud (`targetUserId`). |
| POST   | `/api/relationships/accept`                       | Aceptar (`fromUserId`).            |
| POST   | `/api/relationships/reject`                       | Rechazar (`fromUserId`).           |
| DELETE | `/api/relationships/friend/:friendUserId`         | Eliminar amigo.                    |
| GET    | `/api/relationships/friends?search=&page=&limit=` | Listar/buscar amigos.              |
| GET    | `/api/relationships/pending-requests`             | Listar solicitudes recibidas.      |

### Frontend Relationships

Relationships no tiene pantallas propias; solo expone client y service usados desde Profile.

#### relationshipsClient

- `requestFriendship(targetUserId, token)`
- `getPendingRequests(token)`
- `acceptFriendship(fromUserId, token)`
- `rejectFriendship(fromUserId, token)`

#### relationshipsService

- `requestFriendship`, `getPendingRequests`, `acceptFriendship`, `rejectFriendship`.
- Define `PendingRequestItem`: `userId`, `name`, `username?`, `avatarUrl?`.

---

## Integración Profile ↔ Relationships

### Dependencia en backend

- **Relationships** depende de **Profile** en la capa de infraestructura: `profileReader.ts` importa `ProfileModel` de profile para leer `username`, `name`, `avatarUrl` al listar amigos o solicitudes.
- Profile no depende de Relationships.

### Dependencia en frontend

- **Profile** (ViewModel, modales) depende de **Relationships** (service): `useProfileViewModel` importa `relationshipsService` para solicitudes, aceptar y rechazar.
- Relationships no importa nada de Profile.

### Flujo de datos

```
ProfileScreen
    └── useProfileViewModel
            ├── profileService (perfil, búsqueda)
            └── relationshipsService (solicitudes, aceptar, rechazar)

PendingRequestsModal / AddFriendsModal
    └── reciben datos y handlers del ViewModel
    └── emiten eventos → ViewModel actualiza estado y llama a services
```

### Puntos de conexión

1. **Agregar amigos**: `AddFriendsModal` usa `profileService.searchProfiles` (búsqueda) y `relationshipsService.requestFriendship` (enviar solicitud).
2. **Ver solicitudes**: `PendingRequestsModal` usa `relationshipsService.getPendingRequests` y `relationshipsService.acceptFriendship` / `rejectFriendship`.
3. **Búsqueda de usuarios**: Backend profile `searchProfiles` excluye al usuario actual; la búsqueda es sobre la colección `profiles`.

---

## Flujos de usuario

### 1. Buscar y enviar solicitud

1. Usuario pulsa "Agregar Amigos" → se abre `AddFriendsModal`.
2. Escribe en el buscador → debounce 350 ms → `profileService.searchProfiles` → GET `/api/profile/search?q=...`.
3. Se muestran tarjetas con nombre, @username y "Enviar solicitud".
4. Pulsa "Enviar solicitud" → `relationshipsService.requestFriendship` → POST `/api/relationships/request`.
5. La tarjeta pasa a mostrar "Solicitado".

### 2. Ver y gestionar solicitudes recibidas

1. Usuario pulsa "Ver Solicitudes" → se abre `PendingRequestsModal`.
2. Se carga la lista con `relationshipsService.getPendingRequests` → GET `/api/relationships/pending-requests`.
3. Cada tarjeta muestra nombre, @username y botones "Aceptar" / "Rechazar".
4. "Aceptar" → `relationshipsService.acceptFriendship` → POST `/api/relationships/accept` → se quita de la lista.
5. "Rechazar" → `relationshipsService.rejectFriendship` → POST `/api/relationships/reject` → se quita de la lista.

### 3. Ajustes y cerrar sesión

1. Usuario pulsa el icono de ajustes → se abre `SettingsModal`.
2. Ve datos: nombre, usuario, email, año de unión.
3. "Cerrar sesión" → `onRequestSignOut` → ViewModel ejecuta `signOut`, Screen cierra modal y navega a `/`.
4. "Eliminar cuenta" → confirma → `onConfirmDelete` → ViewModel llama a auth + signOut, Screen cierra modal y navega a `/`.

---

## Dependencias entre features

```
auth (session, token, signOut, deleteAccount)
  ↑
profile (ViewModel usa auth para perfil y modales)
  ↑
relationships (ViewModel usa relationshipsService; back usa ProfileModel vía profileReader)
```

### Orden de montaje en el servidor

```ts
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/relationships', relationshipsRoutes);
```

### Variables de entorno

- Profile y Relationships usan la misma base de datos (por ejemplo `authEnv.dbUri`).
- El middleware `requireAuth` inyecta `req.auth.userId` para rutas protegidas.

---

_Última actualización: Febrero 2026._

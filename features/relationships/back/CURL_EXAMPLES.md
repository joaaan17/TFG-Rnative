# Ejemplos de requests (curl) para Relationships

Reemplaza `TOKEN` con un JWT válido de login y `BASE_URL` con la URL del servidor (ej: `http://localhost:3000`).

## 1. Enviar solicitud de amistad

```bash
curl -X POST "$BASE_URL/api/relationships/request" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"targetUserId": "USER_ID_DEL_OBJETIVO"}'
```

Respuesta 201:

```json
{ "ok": true, "data": { "id": "...", "status": "pending" } }
```

## 2. Aceptar solicitud

```bash
curl -X POST "$BASE_URL/api/relationships/accept" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"fromUserId": "USER_ID_QUE_ENVIO_LA_SOLICITUD"}'
```

Respuesta 200:

```json
{ "ok": true, "data": { "id": "...", "status": "accepted" } }
```

## 3. Rechazar solicitud

```bash
curl -X POST "$BASE_URL/api/relationships/reject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"fromUserId": "USER_ID_QUE_ENVIO_LA_SOLICITUD"}'
```

Respuesta 200:

```json
{ "ok": true, "data": { "message": "Request rejected" } }
```

## 4. Eliminar amigo

```bash
curl -X DELETE "$BASE_URL/api/relationships/friend/USER_ID_DEL_AMIGO" \
  -H "Authorization: Bearer TOKEN"
```

Respuesta 200:

```json
{ "ok": true, "data": { "message": "Friend removed" } }
```

## 5. Listar amigos (paginado)

```bash
curl "$BASE_URL/api/relationships/friends?page=1&limit=20" \
  -H "Authorization: Bearer TOKEN"
```

Respuesta 200:

```json
{
  "ok": true,
  "data": {
    "items": [
      { "userId": "...", "username": "...", "name": "...", "avatarUrl": "..." }
    ],
    "page": 1,
    "limit": 20
  }
}
```

## 6. Buscar entre mis amigos

```bash
curl "$BASE_URL/api/relationships/friends?search=joa&page=1&limit=20" \
  -H "Authorization: Bearer TOKEN"
```

Respuesta 200:

```json
{"ok":true,"data":{"items":[...],"page":1,"limit":20}}
```

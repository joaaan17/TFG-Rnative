# Feature IAPreguntas — Consultorio con IA

Chat conversacional tipo ChatGPT donde el usuario puede hacer preguntas sobre mercados financieros. La IA responde en formato educativo, sin asesoramiento directo.

---

## Arquitectura

Sigue la plantilla del proyecto: **Backend Clean/Hexagonal** y **Frontend MVVM + Service**.

```
Screen (UI) → ViewModel → Service → Client → Backend
```

---

## Backend (Node.js + Express)

### Estructura

```
back/src/
├── domain/                  # Dominio puro (sin Express/OpenAI)
│   ├── iapreguntas.types.ts # AiPrompt, AiResponse
│   └── ports.ts             # AIProviderPort (ask)
├── application/usecases/
│   └── ask-market-ai.ts     # Caso de uso: enriquece prompt y delega a IA
├── infrastructure/openai/
│   └── OpenAIProvider.ts    # Implementación concreta con OpenAI (gpt-4o-mini)
├── config/
│   ├── iapreguntas.env.ts   # OPENAI_API_KEY
│   └── iapreguntas.wiring.ts# Inyección de dependencias
└── api/
    ├── api.routes.ts        # POST /ask (requireAuth)
    └── iapreguntas.controller.ts
```

### Flujo Backend

1. **Ruta**: `POST /api/iapreguntas/ask` — requiere autenticación (Bearer token).
2. **Controller**: extrae `prompt` de `req.body`, valida y llama a `askMarketAI.execute(prompt)`.
3. **Caso de uso AskMarketAI**: enriquece el prompt con contexto de asistente financiero (límites, disclaimers) y delega a `AIProviderPort.ask()`.
4. **OpenAIProvider**: llama a la API de OpenAI (`gpt-4o-mini`), devuelve la respuesta como string.

### Variables de entorno

```env
OPENAI_API_KEY=sk-...
```

---

## Frontend (Expo / React Native)

### Estructura

```
front/src/
├── api/
│   └── iapreguntasClient.ts   # HTTP puro: askAi(prompt, token)
├── services/
│   └── iapreguntasService.ts  # Validaciones + llamada al Client
├── state/
│   └── useIApreguntasViewModel.ts  # Estado y flujo: messages, ask()
├── types/
│   └── iapreguntas.types.ts   # ChatMessage, mensajes de bienvenida
├── components/
│   ├── ChatMessageBubble.tsx  # Burbuja de mensaje (user/assistant)
│   ├── ChatMessageBubble.styles.ts
│   ├── ConsultorioComposer.tsx # Input de texto
│   └── ConsultorioComposer.styles.ts
├── ui/
│   ├── IApreguntasScreen.tsx  # Pantalla principal
│   └── IApreguntas.styles.ts
└── index.ts                   # Barrel export
```

### Flujo Frontend

1. **IApreguntasScreen**: pantalla “tonta”; usa el ViewModel y renderiza UI.
2. **useIApreguntasViewModel**:
   - Estado: `questionText`, `messages`, `loading`, `error`, `welcomeText`
   - Al enviar: añade mensaje usuario → llama `iapreguntasService.askMarketAI()` → añade mensaje IA
   - Requiere sesión (token del AuthContext)
3. **iapreguntasService**: valida prompt y token, llama a `askAi()` del Client.
4. **iapreguntasClient**: `fetch` a `POST /api/iapreguntas/ask` con Bearer token.

### Componentes principales

| Componente              | Descripción                                                                      |
| ----------------------- | -------------------------------------------------------------------------------- |
| **ConsultorioComposer** | Input de texto con placeholder "Escribe tu pregunta...", sin fondo               |
| **ChatMessageBubble**   | Burbuja por mensaje: usuario (negro, texto blanco) / IA (blanco, texto negro)    |
| **IApreguntasScreen**   | Header "CONSULTORIO", saludo animado, FlatList de mensajes, input + botón enviar |

### Estilo del chat

- **Usuario**: burbuja negra, texto blanco, alineada a la derecha.
- **IA**: burbuja blanca con borde, texto negro, alineada a la izquierda.
- **Botón enviar**: caja gris con flecha blanca; al escribir texto, fondo negro.

---

## Integración

### Rutas

- **App (Expo Router)**: `/ia-preguntas` → `app/ia-preguntas.tsx` → `IApreguntasScreen`
- **Servidor**: `app.use('/api/iapreguntas', iapreguntasRoutes)`

### Base URL del Client

- Android emulador: `http://10.0.2.2:3000/api/iapreguntas`
- iOS / Web: `http://localhost:3000/api/iapreguntas`

---

## Requisitos

- Usuario autenticado (token JWT).
- Variable `OPENAI_API_KEY` en `.env` del servidor.
- Dependencia `openai` instalada en el backend.

---

## Mensajes de bienvenida

El ViewModel selecciona un mensaje aleatorio de `IA_PREGUNTAS_WELCOME_MESSAGES` cada vez que se entra en la pantalla, con efecto typewriter.

---

_Última actualización: Febrero 2026_

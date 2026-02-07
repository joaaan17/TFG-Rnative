# iaNoticiasEducativas

Feature backend que integra **NewsAPI** y **ChatGPT** para mostrar noticias con enfoque educativo.

## Flujo de datos

1. **NewsAPI** → noticias crudas (top-headlines, categoría business)
2. **Backend** → obtiene noticia por ID, inyecta contenido en prompt
3. **ChatGPT** (gpt-4o-mini) → reescritura educativa (conceptos clave, contexto, sin recomendaciones)
4. **Frontend** → Client → Service → ViewModel → UI

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/ia-noticias/headlines` | Lista de titulares (con imagen y excerpt) |
| POST | `/api/ia-noticias/explain` | Body: `{ newsId }` → noticia educativa completa |

Requieren autenticación (Bearer token).

## Variables de entorno

```env
NEWS_API_KEY=tu_clave_de_newsapi     # https://newsapi.org/register
OPENAI_API_KEY=sk-...                # Compartida con IAPreguntas
```

## Estructura

```
iaNoticiasEducativas/back/src/
├── domain/
│   ├── iaNoticiasEducativas.types.ts   # RawNews, NewsPreview, EducationalNews
│   └── ports.ts                        # NewsProviderPort, AIProviderPort
├── application/usecases/
│   ├── get-headlines.ts
│   └── explain-news.ts
├── infrastructure/
│   ├── news/NewsAPIProvider.ts
│   └── openai/EducationalOpenAIProvider.ts
├── config/
│   ├── iaNoticiasEducativas.env.ts
│   └── iaNoticiasEducativas.wiring.ts
└── api/
    ├── api.routes.ts
    └── iaNoticiasEducativas.controller.ts
```

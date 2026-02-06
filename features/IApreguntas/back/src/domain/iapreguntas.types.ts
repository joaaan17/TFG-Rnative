/**
 * Entidades del dominio IAPreguntas.
 * Sin dependencias de Express, Mongo ni librerías de infraestructura.
 */

export interface AiPrompt {
  userPrompt: string;
}

export interface AiResponse {
  answer: string;
}

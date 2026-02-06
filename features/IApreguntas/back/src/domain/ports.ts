/**
 * Puertos (interfaces) que el dominio espera.
 * Aquí NO existe OpenAI, ni HTTP, ni Express.
 */

export interface AIProviderPort {
  ask(prompt: string): Promise<string>;
}

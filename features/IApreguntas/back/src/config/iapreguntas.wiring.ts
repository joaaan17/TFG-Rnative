import { OpenAIProvider } from '../infrastructure/openai/OpenAIProvider';
import { AskMarketAI } from '../application/usecases/ask-market-ai';
import { iapreguntasEnv } from './iapreguntas.env';

const aiProvider = new OpenAIProvider(iapreguntasEnv.openaiApiKey);
export const askMarketAI = new AskMarketAI(aiProvider);

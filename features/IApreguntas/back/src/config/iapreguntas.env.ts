import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const iapreguntasEnv = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
};

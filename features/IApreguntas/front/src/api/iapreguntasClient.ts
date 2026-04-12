import { Platform } from 'react-native';
import { env } from '@/config/env';

function getBaseUrl() {
  const base =
    env.apiUrl && env.apiUrl !== 'https://api.example.com'
      ? env.apiUrl.replace(/\/$/, '')
      : Platform.OS === 'android'
        ? 'http://10.0.2.2:3000'
        : 'http://localhost:3000';
  return `${base}/api/iapreguntas`;
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export type AskConsultorioResponse = {
  answer: string;
  experienceAwarded: number;
  newTotal: number;
  consultorioRemainingToday: number;
};

export async function askAi(
  prompt: string,
  token: string,
): Promise<AskConsultorioResponse> {
  const response = await fetch(`${getBaseUrl()}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const message =
      typeof data?.error === 'string'
        ? data.error
        : 'Error al consultar la IA';
    throw new Error(message);
  }

  return data as AskConsultorioResponse;
}

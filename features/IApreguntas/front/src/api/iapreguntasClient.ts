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

export async function askAi(
  prompt: string,
  token: string,
): Promise<{ answer: string }> {
  const response = await fetch(`${getBaseUrl()}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Error al consultar la IA');
  }

  return response.json() as Promise<{ answer: string }>;
}
